const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide valid email',
      },
    },
    academicID: {
      type: String,
      required: [true, 'Please provide academicID'],
      unique: true,
    },

    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
    },
    passwordToken: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'doctor', 'admin'],
      default: 'student',
    },

    department: {
      type: mongoose.Types.ObjectId,
      ref: 'Department',
      required: [true, 'must belong to the department'],
    },
  },

  { timeseries: true },
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'department',
    select: 'name _id',
  });
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
