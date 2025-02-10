const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

let Connection

const connectDB = async () => {

    if(Connection)
    {
        console.log("Db already connected")
        process.exit(1);
    }
    
    try {

        const db = await mongoose.connect(process.env.MONGO_URI);
        Connection = db.connections[0].readyState

        console.log("MongoDB Connected Successfully");

    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
