const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = http.Server(app);

const portNumber = process.env.PORT || 5000;

app.use("/", express.static(path.join(__dirname, "../../frontend/dist/")));
server.listen(portNumber, function () {
    console.log(`Starting server on port ${portNumber}`);
});
