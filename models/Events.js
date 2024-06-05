// it shows the faculty Events
const mongoose = require('mongoose');

const EventsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please, Provide a name'],
    },
    image: String,
    description: {
      type: String,
      // required: [true, "Please, Provide a discription"],
    },
  },
  { timestamps: true },
);
const Events = mongoose.model('Events', EventsSchema);

module.exports = Events;
