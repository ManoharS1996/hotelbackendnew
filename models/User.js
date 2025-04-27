const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordOTP: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  resetMethod: {
    type: String,
    enum: ['email', 'phone'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ... (keep the rest of the model code the same)

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
UserSchema.methods.generatePasswordReset = function() {
  this.resetPasswordOTP = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return this.resetPasswordOTP;
};

// Virtual for profile URL
UserSchema.virtual('profileUrl').get(function() {
  return `/users/${this._id}`;
});

// Transform output to remove sensitive fields
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.resetPasswordOTP;
    delete ret.resetPasswordExpires;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);