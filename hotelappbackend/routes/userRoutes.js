const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
  adminUpdateUser,
  adminDeleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public routes
// (none for user controller)

// Protected routes (require auth)
router.get('/me', auth, getUserById); // Get current user's profile
router.put('/me', auth, updateUser); // Update current user's profile
router.put('/me/password', auth, changePassword); // Change password
router.delete('/me', auth, deleteUser); // Delete current user's account

// Admin routes
router.get('/', [auth, admin], getAllUsers); // Get all users (admin only)
router.get('/:id', [auth, admin], getUserById); // Get any user by ID (admin only)
router.put('/:id', [auth, admin], adminUpdateUser); // Update any user (admin only)
router.delete('/:id', [auth, admin], adminDeleteUser); // Delete any user (admin only)

module.exports = router;