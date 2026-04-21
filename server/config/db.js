const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        console.log("URI starts with:", process.env.MONGO_URI?.slice(0, 20));
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected ✅");
    } catch (error) {
        console.log("ERROR NAME:", error.name);
        console.log("ERROR MESSAGE:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;