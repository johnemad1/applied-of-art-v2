const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'the title must be provided'],
  },
  link: {
    type: String,
    required: [true, 'the description must be provided'],
  },
  departmentId: {
    type: mongoose.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Must belong to the department'],
  },
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
