const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const backend = spawn('npm', ['run', 'dev'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
});

const shutdown = () => {
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

backend.on('exit', (code) => {
  if (code && code !== 0) {
    frontend.kill();
    process.exit(code);
  }
});

frontend.on('exit', (code) => {
  if (code && code !== 0) {
    backend.kill();
    process.exit(code);
  }
});
