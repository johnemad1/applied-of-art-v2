const mongoose = require('mongoose');
const validator = require('validator');
const MemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },

    jobDescription: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    weight: {
      type: Number,
      enum: [1, 2, 3, 4],
    },
    image: {
      type: String,
      // required: [true, 'Please provide an image'], // Uncomment if image is required
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Must belong to a department'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Must be an existing user'],
    },
  },
  { timestamps: true },
);

const Member = mongoose.model('Member', MemberSchema);

module.exports = Member;
