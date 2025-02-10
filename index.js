const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./connectdb');
const Event = require('./models/Event');
const cors = require("cors");

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
    origin: "http://localhost:3000", // Allow requests from frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json()); // Middleware to parse JSON

// Create HTTP Server
const server = http.createServer(app);
const io = socketIo(server); // Initialize Socket.IO with the server

// Import Routes
const authRoutes = require('./routes/authroutes'); 
const eventRoutes = require('./routes/eventroutes');    

// Register Routes
app.use('/api', authRoutes); 
app.use('/event', eventRoutes);  

app.get('/', (req, res) => {
    res.send('Server is running!');
});


// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log('A user connected');

    // When a user joins an event
    socket.on('joinEvent', async (eventId, userId) => {
        try {
            const event = await Event.findById(eventId);
            if (event && !event.attendees.includes(userId)) {
                event.attendees.push(userId);
                await event.save();
                io.emit('attendeeUpdate', { eventId, attendeeCount: event.attendees.length });
            }
        } catch (error) {
            console.error('Error joining event:', error);
        }
    });

    // When a user leaves an event
    socket.on('leaveEvent', async (eventId, userId) => {
        try {
            const event = await Event.findById(eventId);
            if (event) {
                event.attendees = event.attendees.filter(attendee => attendee.toString() !== userId.toString());
                await event.save();
                io.emit('attendeeUpdate', { eventId, attendeeCount: event.attendees.length });
            }
        } catch (error) {
            console.error('Error leaving event:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start Server
const startServer = async () => {
    try {
        await connectDB(); // Ensure database connection before starting server
        console.log("Database connected. Starting server...");

        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Corrected to use `server.listen`
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
};

startServer();
