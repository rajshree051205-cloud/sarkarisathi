import http from "http";
import dotenv from "dotenv";
import connectDB from "./src/db/index.js";

dotenv.config();
connectDB();

const PORT = 5000;

const server = http.createServer((req, res) => {
    res.end("Server running");
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});