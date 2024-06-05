// it shows the faculty News
const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please, Provide a name'],
    },
    image: String,
    description: {
      type: String,
    },
  },
  { timestamps: true },
);
const News = mongoose.model('News', NewsSchema);

module.exports = News;
