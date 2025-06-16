// scripts/apply-changeset.js
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const csPath  = resolve(process.cwd(), 'changeset.md');
const pkgPath = resolve(process.cwd(), 'package.json');

// 1) Read and parse the changeset
const cs = readFileSync(csPath, 'utf8').split(/\r?\n/);
if (cs.length < 2) {
  console.error('🔴 changeset.md is too short; expected version on line 2');
  process.exit(1);
}

const versionLine = cs[1].trim();            // e.g. "# v0.0.9 | Routing…"
const m = versionLine.match(/^#\s*v(\d+\.\d+\.\d+)/i);
if (!m) {
  console.error('🔴 Couldn’t extract version from:', versionLine);
  process.exit(1);
}
const version = m[1];

// 2) Load package.json, bump version, write back
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
if (pkg.version === version) {
  console.log(`🔵 package.json already at v${version}`);
  process.exit(0);
}
pkg.version = version;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`🟢 Updated package.json → v${version}`);
