const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update user profile
const updateUser = async (req, res) => {
  const { name, email } = req.body;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being updated to one that already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    // Generate new token if email was changed
    let token;
    if (email && email !== user.email) {
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token || undefined,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Change user password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send email notification
    await sendEmail(
      user.email,
      'Password Changed',
      `Your password was successfully changed. If you didn't make this change, please contact support immediately.`
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send goodbye email
    await sendEmail(
      user.email,
      'Account Deleted',
      `We're sorry to see you go. Your account has been successfully deleted.`
    );

    await user.remove();

    res.json({ message: 'User account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Admin: Update any user
const adminUpdateUser = async (req, res) => {
  const { name, email, role } = req.body;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being updated to one that already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'User updated successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Admin: Delete any user
const adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send notification email
    await sendEmail(
      user.email,
      'Account Deleted by Admin',
      `Your account has been deleted by an administrator. Please contact support if you believe this was done in error.`
    );

    await user.remove();

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
  adminUpdateUser,
  adminDeleteUser
};