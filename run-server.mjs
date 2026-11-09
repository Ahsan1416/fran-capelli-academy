import { spawn } from 'child_process';

console.log('[Runner] Starting Next.js server on port 3000...');
const child = spawn('npm.cmd', ['start'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('[Runner] Child process error:', err);
});

child.on('exit', (code, signal) => {
  console.log(`[Runner] Next.js exited with code ${code}, signal ${signal}`);
  process.exit(code || 0);
});

// Heartbeat every 20s so stdout is kept active
setInterval(() => {
  process.stdout.write(`[Runner Heartbeat ${new Date().toLocaleTimeString()}] Next.js alive on port 3000\n`);
}, 20000);

