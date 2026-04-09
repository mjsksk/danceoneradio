import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { blake2b } from "blakejs";

const DEFAULT_UNTRUSTED_COMMENT = "signature from minisign secret key";
const DEFAULT_KEY_PATH = ".tauri/dance-one-radio.key";
const DEFAULT_CONFIG_PATH = "src-tauri/tauri.conf.json";
const DEFAULT_OUTPUT_PATH = "public/updates/latest.json";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    args[key] = value;
    index += 1;
  }

  return args;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function toBase64Url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function blake2bDigest(buffer, outputLength) {
  return Buffer.from(blake2b(buffer, undefined, outputLength));
}

function parseEncodedSecretKey(secretKeyText) {
  const decoded = Buffer.from(secretKeyText.trim(), "base64");
  const prelude = Buffer.from("untrusted comment: ");
  const preludeLength = prelude.length;

  assert(decoded.subarray(0, preludeLength).equals(prelude), "Unsupported updater secret key format.");

  const commentEnd = decoded.indexOf("\n", preludeLength);
  const encodedInfoStart = commentEnd + 1;
  const encodedInfoEnd = decoded.indexOf("\n", encodedInfoStart);
  const encodedInfo = decoded.subarray(encodedInfoStart, encodedInfoEnd).toString();
  const info = Buffer.from(encodedInfo, "base64");

  assert(info.length === 158, "Unexpected updater secret key payload length.");

  return {
    signatureAlgorithm: info.subarray(0, 2),
    kdfAlgorithm: info.subarray(2, 4),
    checksumAlgorithm: info.subarray(4, 6),
    salt: info.subarray(6, 38),
    opsLimit: info.readUInt32LE(38),
    memLimit: info.readUInt32LE(46),
    encryptedPayload: info.subarray(info.length - 104),
  };
}

function deriveSecretKey(parsedKey, password = "") {
  const r = 8;
  const p = 1;
  const N = parsedKey.memLimit / (128 * r);
  const expectedOpsLimit = 4 * N * r;

  assert(Number.isInteger(N) && N > 1, "Unable to derive scrypt cost parameter from updater key.");
  assert(expectedOpsLimit === parsedKey.opsLimit, "Updater key scrypt parameters do not match expected minisign values.");
  assert(parsedKey.kdfAlgorithm.equals(Buffer.from("Sc")), "Unsupported updater key derivation algorithm.");
  assert(parsedKey.checksumAlgorithm.equals(Buffer.from("B2")), "Unsupported updater key checksum algorithm.");

  const derived = crypto.scryptSync(Buffer.from(password, "utf8"), parsedKey.salt, 104, {
    N,
    r,
    p,
    maxmem: Math.max(parsedKey.memLimit * 2, 64 * 1024 * 1024),
  });

  const decrypted = Buffer.alloc(104);
  for (let index = 0; index < 104; index += 1) {
    decrypted[index] = derived[index] ^ parsedKey.encryptedPayload[index];
  }

  const keyId = decrypted.subarray(0, 8);
  const secretKey = decrypted.subarray(8, 72);
  const checksum = decrypted.subarray(72);
  const expectedChecksum = blake2bDigest(Buffer.concat([parsedKey.signatureAlgorithm, keyId, secretKey]), 32);

  assert(expectedChecksum.equals(checksum), "Updater key checksum validation failed.");

  return { keyId, secretKey };
}

function parseEncodedPublicKey(publicKeyText) {
  const decoded = Buffer.from(publicKeyText.trim(), "base64");
  const prelude = Buffer.from("untrusted comment: ");
  const preludeLength = prelude.length;

  assert(decoded.subarray(0, preludeLength).equals(prelude), "Unsupported updater public key format.");

  const commentEnd = decoded.indexOf("\n", preludeLength);
  const infoStart = commentEnd + 1;
  const infoEnd = decoded.indexOf("\n", infoStart);
  const info = Buffer.from(decoded.subarray(infoStart, infoEnd).toString(), "base64");

  return {
    signatureAlgorithm: info.subarray(0, 2),
    keyId: info.subarray(2, 10),
    publicKey: info.subarray(10),
  };
}

function createEd25519Keys(secretKey64, publicKey32) {
  const seed = secretKey64.subarray(0, 32);

  const privateKey = crypto.createPrivateKey({
    key: {
      kty: "OKP",
      crv: "Ed25519",
      d: toBase64Url(seed),
      x: toBase64Url(publicKey32),
    },
    format: "jwk",
  });

  const publicKey = crypto.createPublicKey({
    key: {
      kty: "OKP",
      crv: "Ed25519",
      x: toBase64Url(publicKey32),
    },
    format: "jwk",
  });

  return { privateKey, publicKey };
}

function createSignatureContent({ keyId, privateKey, publicKey, fileBuffer, trustedComment, untrustedComment }) {
  const hashedContent = blake2bDigest(fileBuffer, 64);
  const signature = crypto.sign(null, hashedContent, privateKey);
  const signatureInfo = Buffer.concat([Buffer.from("ED"), keyId, signature]);
  const globalSignature = crypto.sign(null, Buffer.concat([signature, Buffer.from(trustedComment, "utf8")]), privateKey);

  assert(crypto.verify(null, hashedContent, publicKey, signature), "Generated updater signature failed verification.");
  assert(
    crypto.verify(null, Buffer.concat([signature, Buffer.from(trustedComment, "utf8")]), publicKey, globalSignature),
    "Generated updater trusted comment signature failed verification.",
  );

  return [
    `untrusted comment: ${untrustedComment}`,
    signatureInfo.toString("base64"),
    `trusted comment: ${trustedComment}`,
    globalSignature.toString("base64"),
  ].join("\n");
}

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readExistingManifest(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getInitialPlatforms(existingManifest, existingTargetKey) {
  if (!existingManifest) {
    return {};
  }

  if (existingManifest.platforms && typeof existingManifest.platforms === "object") {
    return { ...existingManifest.platforms };
  }

  if (existingManifest.url && existingManifest.signature) {
    assert(
      existingTargetKey,
      "Existing manifest uses the single-platform format. Re-run with --existing-target-key to preserve it while adding a platform-specific entry.",
    );

    return {
      [existingTargetKey]: {
        url: existingManifest.url,
        signature: existingManifest.signature,
      },
    };
  }

  return {};
}

const args = parseArgs(process.argv.slice(2));
const version = args.version;
const installerPath = args.installer;
const assetUrl = args.url;
const targetKey = args["target-key"];
const existingTargetKey = args["existing-target-key"];

assert(version, "Missing required --version argument.");
assert(installerPath, "Missing required --installer argument.");
assert(assetUrl, "Missing required --url argument.");

const keyPath = args.key ?? DEFAULT_KEY_PATH;
const configPath = args.config ?? DEFAULT_CONFIG_PATH;
const outputPath = args.output ?? DEFAULT_OUTPUT_PATH;
const trustedComment = args["trusted-comment"] ?? Math.floor(Date.now() / 1000).toString(10);
const untrustedComment = args["untrusted-comment"] ?? DEFAULT_UNTRUSTED_COMMENT;
const signatureOutputPath = args["sig-output"];
const existingManifest = readExistingManifest(outputPath);
const notes = args.notes ?? existingManifest?.notes ?? "Dance One Radio desktop app update.";
const pubDate = args["pub-date"] ?? existingManifest?.pub_date ?? new Date().toISOString();

const tauriConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
const installerBuffer = fs.readFileSync(installerPath);
const parsedSecretKey = parseEncodedSecretKey(fs.readFileSync(keyPath, "utf8"));
const parsedPublicKey = parseEncodedPublicKey(tauriConfig.plugins.updater.pubkey);
const derivedSecretKey = deriveSecretKey(parsedSecretKey);

assert(parsedPublicKey.keyId.equals(derivedSecretKey.keyId), "Updater secret key does not match the configured public key.");
assert(parsedPublicKey.signatureAlgorithm.equals(Buffer.from("Ed")), "Unexpected updater public key algorithm.");

const { privateKey, publicKey } = createEd25519Keys(derivedSecretKey.secretKey, parsedPublicKey.publicKey);
const signatureContent = createSignatureContent({
  keyId: derivedSecretKey.keyId,
  privateKey,
  publicKey,
  fileBuffer: installerBuffer,
  trustedComment,
  untrustedComment,
});

const latestJson = targetKey
  ? {
      version,
      notes,
      pub_date: pubDate,
      platforms: {
        ...getInitialPlatforms(existingManifest, existingTargetKey),
        [targetKey]: {
          url: assetUrl,
          signature: signatureContent,
        },
      },
    }
  : {
      version,
      notes,
      pub_date: pubDate,
      url: assetUrl,
      signature: signatureContent,
    };

ensureDirectory(outputPath);
fs.writeFileSync(outputPath, `${JSON.stringify(latestJson, null, 2)}\n`);

if (signatureOutputPath) {
  ensureDirectory(signatureOutputPath);
  fs.writeFileSync(signatureOutputPath, `${signatureContent}\n`);
}

console.log(
  JSON.stringify(
    {
      version,
      outputPath,
      signatureOutputPath: signatureOutputPath ?? null,
      assetUrl,
      targetKey: targetKey ?? null,
      pubDate,
    },
    null,
    2,
  ),
);
