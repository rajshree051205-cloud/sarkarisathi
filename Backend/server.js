const http = require("http");

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("SarkariSaathi Backend Running!");
});

server.listen(5000, () => {
    console.log("Server running on port 5000");
});