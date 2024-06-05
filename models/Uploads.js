const mongoose = require('mongoose');
const validator = require('validator');
const UploadsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      // required: true,
      minlenth: [10, 'too short description'],
    },

    imageCover: {
      type: String,
      required: [true, 'A Project must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    videoLink: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    published: {
      type: Boolean,
      default: false,
    },
    department: {
      type: mongoose.Types.ObjectId,
      ref: 'Department',
      required: [true, 'must belong to the department'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'must belong to the User'],
    },
  },
  { timestamps: true },
);

// Check for middleware functions

UploadsSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'approved') {
    this.published = true;
  }
  next();
});

// Check for hooks
UploadsSchema.post('save', function (doc, next) {
  // Check if status or published fields are modified and log a message if they are
  if (doc.isModified('status') || doc.isModified('published')) {
    console.log('Hook: Status or published fields modified');
  }
  next();
});

UploadsSchema.index({ status: 1 });
UploadsSchema.index({ published: 1 });

UploadsSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'department',
    select: 'name _id',
  });
  next();
});

UploadsSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name _id',
  });
  next();
});

const Upload = mongoose.model('Upload', UploadsSchema);

module.exports = Upload;
