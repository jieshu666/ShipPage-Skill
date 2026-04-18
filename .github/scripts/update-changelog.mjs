#!/usr/bin/env node
// Generate a new ChangelogEntry from git log between two refs and insert it
// into src/content/changelog.ts at the CHANGELOG_START marker.
//
// Usage:
//   node .github/scripts/update-changelog.mjs <version> <fromRef> <toRef>
//
// Example:
//   node .github/scripts/update-changelog.mjs 0.3.0 v0.2.0 HEAD
//
// Conventional Commit prefixes are mapped to sections:
//   feat:    -> added
//   fix:     -> fixed
//   refactor|perf|style|chore|docs|build|ci|test: -> changed
//   revert:  -> changed
//   remove|deprecate: -> removed
//   security: -> security
// Unmatched commits are dropped.

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const version = process.argv[2];
const fromRef = process.argv[3];
const toRef = process.argv[4] || 'HEAD';

if (!version || !fromRef) {
  console.error('Usage: update-changelog.mjs <version> <fromRef> [toRef]');
  process.exit(1);
}

const CHANGELOG_PATH = resolve('src/content/changelog.ts');

function git(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

const range = `${fromRef}..${toRef}`;
let rawLog;
try {
  rawLog = git(`git log --pretty=format:%s ${range}`);
} catch (e) {
  console.error(`git log ${range} failed: ${e.message}`);
  process.exit(1);
}

const subjects = rawLog.split('\n').filter(Boolean);

const SECTION_FOR = {
  feat: 'added',
  feature: 'added',
  fix: 'fixed',
  bugfix: 'fixed',
  refactor: 'changed',
  perf: 'changed',
  style: 'changed',
  chore: 'changed',
  docs: 'changed',
  build: 'changed',
  ci: 'changed',
  test: 'changed',
  revert: 'changed',
  remove: 'removed',
  deprecate: 'removed',
  security: 'security',
};

const sections = { added: [], changed: [], fixed: [], removed: [], security: [] };

for (const subj of subjects) {
  const m = subj.match(/^([a-z]+)(?:\(([^)]+)\))?!?:\s*(.+)$/i);
  if (!m) continue;
  const prefix = m[1].toLowerCase();
  const scope = m[2];
  const desc = m[3].trim();
  const bucket = SECTION_FOR[prefix];
  if (!bucket) continue;
  const line = scope ? `**${scope}:** ${desc}` : desc;
  sections[bucket].push(line);
}

const nonEmpty = Object.fromEntries(
  Object.entries(sections).filter(([, v]) => v.length > 0),
);

if (Object.keys(nonEmpty).length === 0) {
  console.log('No Conventional Commits found in range. Skipping changelog update.');
  process.exit(0);
}

const today = new Date().toISOString().split('T')[0];
const summary = summariseSections(nonEmpty);

const indentedSections = Object.entries(nonEmpty)
  .map(([key, items]) => {
    const lines = items.map((it) => `        ${JSON.stringify(it)},`).join('\n');
    return `      ${key}: [\n${lines}\n      ],`;
  })
  .join('\n');

const newEntry = `  {
    version: ${JSON.stringify(version)},
    date: ${JSON.stringify(today)},
    summary: ${JSON.stringify(summary)},
    sections: {
${indentedSections}
    },
  },`;

const file = readFileSync(CHANGELOG_PATH, 'utf8');
const arrayOpen = 'export const changelog: ChangelogEntry[] = [';

const insertIdx = file.indexOf(arrayOpen);
if (insertIdx === -1) {
  console.error('Could not find array declaration in changelog.ts');
  process.exit(1);
}

const afterArrayOpen = insertIdx + arrayOpen.length;
const updated = file.slice(0, afterArrayOpen) + '\n' + newEntry + file.slice(afterArrayOpen);

writeFileSync(CHANGELOG_PATH, updated, 'utf8');

console.log(`Inserted changelog entry for v${version} (${today})`);
console.log(`Sections: ${Object.entries(nonEmpty).map(([k, v]) => `${k}=${v.length}`).join(', ')}`);

function summariseSections(bySection) {
  const parts = [];
  for (const [key, items] of Object.entries(bySection)) {
    parts.push(`${items.length} ${key}`);
  }
  return parts.join(', ');
}
