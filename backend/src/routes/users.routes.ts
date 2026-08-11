import { Router } from 'express';
import { updateUser, deleteUser } from '../controllers/users.controller';

const router = Router();

// @route   PUT /api/users/:uid
// @desc    Update a user's details and role
// @access  Public (for now, should be Admin only)
router.put('/:uid', updateUser);

// @route   DELETE /api/users/:uid
// @desc    Delete a user completely
// @access  Public (for now, should be Admin only)
router.delete('/:uid', deleteUser);

export default router;
