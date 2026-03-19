const { execFileSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('🏗️  Building Dance One Radio portable Windows app...\n');

try {
  execFileSync(npmCmd, ['run', 'build:desktop:portable'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch (error) {
  console.error('❌ Desktop app build failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Build completed successfully!');
console.log(`📁 Output directory: ${path.join(__dirname, 'release')}`);
