const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      //required: [true, 'the name must be provided'],
      unique: [true, 'the name must be unique'],
    },

    slug: {
      type: String,
      lowercase: true,
    },
  },

  { timeseries: true },
);

DepartmentSchema.index({ name: 1, unique: true });
const Department = mongoose.model('Department', DepartmentSchema);
module.exports = Department;
