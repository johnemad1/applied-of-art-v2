const mongoose = require('mongoose');

const ReseachSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    pdfs: [
      {
        type: String,
        required: [true, 'please provide a pdf'],
      },
    ],

    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'must belong to the user'],
    },
    departmentId: {
      type: mongoose.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Must belong to the department '],
    },
  },
  { timestamps: true },
);

const Research = mongoose.model('Research', ReseachSchema);
module.exports = Research;
