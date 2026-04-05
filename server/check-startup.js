#!/usr/bin/env node
/**
 * Run this BEFORE npm run dev to diagnose startup issues:
 *   node check-startup.js
 */
const fs = require('fs');
const path = require('path');

let ok = true;
const check = (label, pass, fix) => {
  const icon = pass ? '✅' : '❌';
  console.log(`${icon} ${label}`);
  if (!pass) { console.log(`   → Fix: ${fix}`); ok = false; }
};

// 1. .env exists
const envPath = path.join(__dirname, '.env');
check(
  '.env file exists',
  fs.existsSync(envPath),
  'Run: copy .env.example .env  (then fill in JWT_SECRET and DATABASE_URL)'
);

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');

  // 2. DATABASE_URL set
  check(
    'DATABASE_URL is set',
    env.includes('DATABASE_URL=') && !env.includes('DATABASE_URL=""'),
    'Edit .env and set DATABASE_URL=postgresql://postgres:password@localhost:5432/mango_king_db'
  );

  // 3. JWT_SECRET set and long enough
  const jwtMatch = env.match(/JWT_SECRET="?([^"\n]+)"?/);
  const jwtSecret = jwtMatch?.[1] || '';
  check(
    `JWT_SECRET is set (${jwtSecret.length} chars, need ≥32)`,
    jwtSecret.length >= 32,
    'Edit .env: JWT_SECRET="any-random-32-character-string-here"'
  );
}

// 4. node_modules exists
check(
  'node_modules installed',
  fs.existsSync(path.join(__dirname, 'node_modules', 'express')),
  'Run: npm install'
);

// 5. Prisma client generated
check(
  'Prisma client generated',
  fs.existsSync(path.join(__dirname, 'node_modules', '.prisma', 'client')),
  'Run: npm run db:generate  (then: npm run db:push)'
);

console.log('');
if (ok) {
  console.log('🎉 All checks passed! Run: npm run dev');
} else {
  console.log('⚠️  Fix the issues above, then run: npm run dev');
}
