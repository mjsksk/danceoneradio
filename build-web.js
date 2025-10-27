const { execSync } = require('child_process');
const path = require('path');

// Use the locally installed vite
const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite');

try {
  console.log('Building web app with local Vite...');
  execSync(`"${vitePath}" build`, { stdio: 'inherit', shell: true });
  console.log('Web app built successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
