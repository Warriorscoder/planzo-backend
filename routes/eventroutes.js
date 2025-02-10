const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const router = express.Router();

// Create event route
router.post('/create-event', async (req, res) => {
    const { name, description, eventDate, location, category, creator } = req.body;

    if (!name || !description || !eventDate || !location || !creator) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const event = new Event({
            name,
            description,
            eventDate,
            location,
            category,
            creator
        });

        await event.save();
        res.status(201).json(event);

    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// All events route
router.post('/all-events', async (req, res) => {
    const { email } = req.body; // Expect userId in the body
    // console.log(userId)
    // Check if userId is provided
    if (!email) {
        return res.status(400).json({ message: 'email is required' });
    }

    try {
        // Find the user by their ID
        const user = await User.findById(email);
        // console.log(user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all events where the creator is the user (using their ID)
        const events = await Event.find({ creator: userId })
            .populate('creator', 'name')  // Optionally populate creator data
            .sort({ eventDate: 1 });  // Sorting by eventDate in ascending order

        // Check if events exist for the user
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for this user' });
        }

        res.status(200).json(events); // Return the events as response

    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get event by id    
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('creator', 'name').populate('attendees', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update event
router.put('/update-event/:id', async (req, res) => {
    const { name, description, eventDate, location, category, status } = req.body;
  
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ message: 'Event not found' });
  
      // Check if user is the creator of the event
      if (event.creator.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      event.name = name || event.name;
      event.description = description || event.description;
      event.eventDate = eventDate || event.eventDate;
      event.location = location || event.location;
      event.category = category || event.category;
      event.status = status || event.status;
  
      await event.save();
      res.status(200).json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // DELETE event
router.post('/delete-event/:id', async (req, res) => {
    const {userId} = req.body
    // console.log("userId",userId)
    try {
      const event = await Event.findById(req.params.id);
    //   console.log(event.creator.toString())
      if (!event) return res.status(404).json({ message: 'Event not found' });
  
      // Check if user is the creator of the event
      if (event.creator.toString() !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      await event.deleteOne();
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // upcomming route
  router.get('/upcoming-events', async (req, res) => {
    try {
        const events = await Event.find({ eventDate: { $gte: new Date() } })
            .populate('creator', 'name')
            .sort({ eventDate: 1 }); // Sorting in ascending order to show the earliest event first
        
        if (events.length === 0) {
            return res.status(404).json({ message: 'No upcoming events found' });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching upcoming events:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to get past events
router.get('/past-events', async (req, res) => {
    try {
        const events = await Event.find({ eventDate: { $lt: new Date() } })
            .populate('creator', 'name')
            .sort({ eventDate: -1 }); // Sorting in descending order to show the most recent past events first
        
        if (events.length === 0) {
            return res.status(404).json({ message: 'No past events found' });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching past events:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Route to filter events by category or date range (startDate to endDate)
router.post('/filter-events', async (req, res) => {
    const { category, startDate, endDate } = req.body;

    const filters = {};
    
    if (category) {
        filters.category = category;
    }

    if (startDate && endDate) {
        filters.eventDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
        filters.eventDate = { $gte: new Date(startDate) };
    } else if (endDate) {
        filters.eventDate = { $lte: new Date(endDate) };
    }

    try {
        const events = await Event.find(filters)
            .populate('creator', 'name')
            .sort({ eventDate: 1 }); // Sorting events based on date (ascending)
        
        if (events.length === 0) {
            return res.status(404).json({ message: 'No events found for the given filters' });
        }

        res.status(200).json(events);
    } catch (error) {
        console.error("Error filtering events:", error);
        res.status(500).json({ message: "Server error" });
    }
});
  
module.exports = router;
