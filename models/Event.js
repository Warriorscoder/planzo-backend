const mongoose = require('mongoose');

// Event Schema
const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Music', 'Workshop', 'Conference', 'Webinar', 'Meetup', 'Sports', 'Other'],
    default: 'Other',
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to User model
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User who created the event
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active',
  },
});

EventSchema.pre('save', function (next) {
  // Automatically set the updatedAt field before saving the event
  this.updatedAt = Date.now();
  next();
});

// Event Model
module.exports = mongoose.model('Event', EventSchema);
