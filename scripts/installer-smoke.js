const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = process.cwd();
const releaseDir = path.join(root, 'release');

assert.ok(fs.existsSync(releaseDir), 'release directory is missing');

const installerNames = fs
  .readdirSync(releaseDir)
  .filter((name) => name.endsWith('.exe') && !name.toLowerCase().includes('portable'));

assert.ok(installerNames.length > 0, 'installer exe is missing');

const installerPath = path.join(releaseDir, installerNames[0]);
const stats = fs.statSync(installerPath);

assert.ok(stats.size > 0, 'installer exe is empty');

console.log(`installer smoke ok: ${installerNames[0]}`);
