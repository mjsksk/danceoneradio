import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const desktopDir = path.join(rootDir, 'desktop-app');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const viteCmd = path.join(rootDir, 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');

const target = process.argv[2] ?? 'portable';
const scriptMap = {
  portable: 'build:portable',
};

const desktopBuildScript = scriptMap[target];

if (!desktopBuildScript) {
  console.error(`Unsupported desktop build target: ${target}`);
  console.error(`Supported targets: ${Object.keys(scriptMap).join(', ')}`);
  process.exit(1);
}

if (!fs.existsSync(viteCmd)) {
  console.error('Vite was not found. Run `npm install` in the repository root first.');
  process.exit(1);
}

const run = (cwd, args) => {
  execFileSync(npmCmd, args, {
    cwd,
    stdio: 'inherit',
  });
};

console.log('Building the desktop-only renderer bundle...');
execFileSync(viteCmd, ['build', '--config', 'vite.config.desktop.ts'], {
  cwd: rootDir,
  stdio: 'inherit',
});

console.log(`Packaging the Electron app for Windows (${target})...`);
run(rootDir, ['--prefix', 'desktop-app', 'run', desktopBuildScript]);

console.log('Desktop build complete.');
console.log(`Renderer bundle: ${path.join(desktopDir, 'app')}`);
console.log(`Packaged output: ${path.join(desktopDir, 'release')}`);
