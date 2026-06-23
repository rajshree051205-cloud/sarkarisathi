import dotenv from "dotenv";
import connectDB from "./src/db/index.js";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed!", err);
    });