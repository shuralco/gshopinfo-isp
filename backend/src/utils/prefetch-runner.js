const { exec } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(process.cwd(), '..');
const DEFAULT_COMMAND = process.env.STRAPI_PREFETCH_COMMAND || 'npm run prefetch';

let isRunning = false;
let shouldRerun = false;

function log(level, message) {
  if (global.strapi && strapi.log && typeof strapi.log[level] === 'function') {
    strapi.log[level](message);
  } else {
    console[level === 'error' ? 'error' : 'log'](message);
  }
}

function runPrefetch(reason = 'unspecified') {
  if (isRunning) {
    shouldRerun = true;
    log('info', `[prefetch] Prefetch already running, queueing new run (reason: ${reason})`);
    return;
  }

  isRunning = true;
  shouldRerun = false;
  log('info', `[prefetch] Starting command "${DEFAULT_COMMAND}" (reason: ${reason})`);

  const child = exec(DEFAULT_COMMAND, { cwd: projectRoot }, (error, stdout, stderr) => {
    if (stdout) {
      log('info', `[prefetch] stdout: ${stdout.trim()}`);
    }
    if (stderr) {
      log('info', `[prefetch] stderr: ${stderr.trim()}`);
    }
    if (error) {
      log('error', `[prefetch] Command failed: ${error.message}`);
    } else {
      log('info', '[prefetch] Command completed successfully');
    }

    isRunning = false;
    if (shouldRerun) {
      runPrefetch('queued');
    }
  });

  child.on('error', (error) => {
    log('error', `[prefetch] Failed to spawn command: ${error.message}`);
    isRunning = false;
  });
}

module.exports = {
  runPrefetch,
};
