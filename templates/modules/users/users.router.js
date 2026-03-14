import { Router } from 'express';
import { authenticate, requireRole } from './users.middleware.js';
import {
  listUsers,
  getUser,
  updateUser,
  changePassword,
  softDeleteUser,
  setRole,
} from './users.service.js';
import { validate, updateUserSchema, changePasswordSchema, paginationSchema } from '../validation/validate.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

export const usersRouter = Router();

// All routes require authentication
usersRouter.use(authenticate);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
usersRouter.get('/', requireRole('admin'), validate(paginationSchema, 'query'), async (req, res, next) => {
  try {
    const result = await listUsers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User object
 *       404:
 *         description: Not found
 */
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Update a user's profile
 *     tags: [Users]
 */
usersRouter.patch('/:id', validate(updateUserSchema), async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/users/{id}/password:
 *   post:
 *     summary: Change a user's password
 *     tags: [Users]
 */
usersRouter.post('/:id/password', validate(changePasswordSchema), async (req, res, next) => {
  try {
    const result = await changePassword(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/users/{id}/role:
 *   patch:
 *     summary: Set a user's role (admin only)
 *     tags: [Users]
 */
usersRouter.patch('/:id/role', requireRole('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });
    const user = await setRole(req.params.id, role);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Soft-delete a user (admin only)
 *     tags: [Users]
 */
usersRouter.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const result = await softDeleteUser(req.params.id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
});
