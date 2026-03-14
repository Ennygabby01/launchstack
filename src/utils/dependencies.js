// ─── Deprecated packages and their modern replacements ────────────────────────

export const DEPRECATED = {
  request: 'native fetch (built-in since Node 18)',
  'node-sass': 'sass',
  moment: 'dayjs',
  underscore: 'lodash-es',
  'node-uuid': 'uuid',
  'body-parser': 'express built-in (express.json())',
  mkdirp: 'fs.mkdir with { recursive: true }',
  rimraf: 'fs.rm with { recursive: true }',
  glob: 'node:fs/promises glob (Node 22+)',
};

// ─── Production dependencies by stack ─────────────────────────────────────────

export const FRAMEWORK_DEPS = {
  express: ['express', 'cors', 'helmet', 'dotenv'],
  fastify: ['fastify', '@fastify/cors', '@fastify/helmet', 'dotenv'],
  nestjs: ['@nestjs/core', '@nestjs/common', '@nestjs/platform-express', 'reflect-metadata', 'rxjs'],
  django: [],
  flask: [],
};

export const FRAMEWORK_DEV_DEPS = {
  express: ['nodemon'],
  fastify: ['nodemon'],
  nestjs: ['typescript', 'ts-node', '@types/node', 'nodemon', 'tsconfig-paths'],
  django: [],
  flask: [],
};

export const DB_DEPS = {
  postgresql: ['pg'],
  mysql: ['mysql2'],
  mongodb: ['mongodb'],
  sqlite: ['better-sqlite3'],
};

export const ORM_DEPS = {
  prisma: ['@prisma/client'],
  drizzle: ['drizzle-orm'],
  sequelize: ['sequelize'],
  mongoose: ['mongoose'],
};

export const ORM_DEV_DEPS = {
  prisma: ['prisma'],
  drizzle: ['drizzle-kit'],
};

export const AUTH_DEPS = {
  jwt: ['jsonwebtoken', 'bcryptjs'],
  oauth: ['passport', 'passport-oauth2'],
};

export const MODULE_DEPS = {
  'rate-limit': ['express-rate-limit'],
  logging: ['winston', 'morgan'],
  email: ['nodemailer'],
  redis: ['ioredis'],
  queue: ['bullmq'],
  'file-storage': ['@aws-sdk/client-s3', 'multer'],
  swagger: ['swagger-jsdoc', 'swagger-ui-express'],
  validation: ['zod'],
  socket: ['socket.io'],
  users: ['jsonwebtoken', 'bcryptjs'],
};

export const PAYMENT_DEPS = {
  stripe: ['stripe'],
  paypal: ['@paypal/checkout-server-sdk'],
  paystack: ['paystack'],
  flutterwave: ['flutterwave-node-v3'],
};

export const FRONTEND_DEPS = {
  next: ['next', 'react', 'react-dom'],
  'react-vite': ['react', 'react-dom'],
  vue: ['vue'],
  svelte: [],
  alpine: ['alpinejs'],
  static: [],
};

export const FRONTEND_DEV_DEPS = {
  next: [],
  'react-vite': ['@vitejs/plugin-react', 'vite'],
  vue: ['@vitejs/plugin-vue', 'vite'],
  svelte: ['@sveltejs/vite-plugin-svelte', 'vite', 'svelte'],
  alpine: [],
  static: [],
};

export const STYLING_DEPS = {
  tailwind: ['tailwindcss', '@tailwindcss/vite'],
  scss: ['sass'],
  css: [],
};

export const EXTRAS_DEV_DEPS = {
  eslint: ['eslint'],
  prettier: ['prettier'],
  testing: ['vitest', '@testing-library/react'],
};

// ─── Resolve all deps from a config object ────────────────────────────────────

export function resolveDependencies(config) {
  const isPython = ['django', 'flask'].includes(config.backendFramework);
  if (isPython) return { deps: [], devDeps: [], isPython: true };

  const deps = [];
  const devDeps = [];

  if (config.backendFramework && config.backendFramework !== 'none') {
    deps.push(...(FRAMEWORK_DEPS[config.backendFramework] || []));
    devDeps.push(...(FRAMEWORK_DEV_DEPS[config.backendFramework] || []));
  }

  if (config.frontendFramework && config.frontendFramework !== 'none') {
    deps.push(...(FRONTEND_DEPS[config.frontendFramework] || []));
    devDeps.push(...(FRONTEND_DEV_DEPS[config.frontendFramework] || []));
  }

  if (config.database && config.database !== 'none') {
    deps.push(...(DB_DEPS[config.database] || []));
  }

  if (config.orm && config.orm !== 'none') {
    deps.push(...(ORM_DEPS[config.orm] || []));
    devDeps.push(...(ORM_DEV_DEPS[config.orm] || []));
  }

  if (config.auth && config.auth !== 'none') {
    deps.push(...(AUTH_DEPS[config.auth] || []));
  }

  for (const mod of config.modules || []) {
    deps.push(...(MODULE_DEPS[mod] || []));
  }

  if (config.payments && config.payments !== 'none') {
    deps.push(...(PAYMENT_DEPS[config.payments] || []));
  }

  if (config.styling && config.styling !== 'css') {
    deps.push(...(STYLING_DEPS[config.styling] || []));
  }

  for (const extra of config.extras || []) {
    devDeps.push(...(EXTRAS_DEV_DEPS[extra] || []));
  }

  return {
    deps: [...new Set(deps)],
    devDeps: [...new Set(devDeps)],
    isPython: false,
  };
}

// ─── Check for deprecated packages ───────────────────────────────────────────

export function checkDeprecated(packages) {
  const warnings = [];
  for (const pkg of packages) {
    if (DEPRECATED[pkg]) {
      warnings.push({ pkg, replacement: DEPRECATED[pkg] });
    }
  }
  return warnings;
}
