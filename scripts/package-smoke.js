const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const root = process.cwd();
const exePath = path.join(root, 'release', 'win-unpacked', 'Pika-Boo.exe');

assert.ok(fs.existsSync(exePath), 'packaged exe is missing');

const launch = spawnSync(exePath, ['--smoke-test'], {
  cwd: path.dirname(exePath),
  env: { ...process.env, PIKA_BOO_SMOKE_TEST: '1' },
  encoding: 'utf8',
  timeout: 30000,
});

assert.equal(launch.status, 0, `packaged smoke launch failed: ${launch.stderr || launch.stdout}`);

console.log('package smoke ok');
