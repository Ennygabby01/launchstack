/**
 * User service — CRUD + role management.
 *
 * This is a reference implementation using an in-memory store.
 * Replace with your ORM (Prisma, Drizzle, Mongoose, etc.) as needed.
 */

import bcrypt from 'bcryptjs';

// Replace with your DB/ORM query layer
const db = {
  users: [],
  nextId: 1,
};

function findById(id) {
  return db.users.find((u) => u.id === id && !u.deletedAt) ?? null;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function listUsers({ page = 1, limit = 20 } = {}) {
  const active = db.users.filter((u) => !u.deletedAt);
  const total = active.length;
  const data = active.slice((page - 1) * limit, page * limit).map(sanitize);
  return { data, total, page, limit };
}

// ─── Get one ──────────────────────────────────────────────────────────────────

export async function getUser(id) {
  const user = findById(id);
  if (!user) return null;
  return sanitize(user);
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateUser(id, fields) {
  const user = findById(id);
  if (!user) return null;
  Object.assign(user, fields, { updatedAt: new Date() });
  return sanitize(user);
}

// ─── Change password ──────────────────────────────────────────────────────────

export async function changePassword(id, { currentPassword, newPassword }) {
  const user = findById(id);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 400 });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.updatedAt = new Date();
  return { success: true };
}

// ─── Soft delete ──────────────────────────────────────────────────────────────

export async function softDeleteUser(id) {
  const user = findById(id);
  if (!user) return null;
  user.deletedAt = new Date();
  return { success: true };
}

// ─── Role ─────────────────────────────────────────────────────────────────────

export async function setRole(id, role) {
  const user = findById(id);
  if (!user) return null;
  user.role = role;
  user.updatedAt = new Date();
  return sanitize(user);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitize({ passwordHash: _, ...user }) {
  return user;
}
