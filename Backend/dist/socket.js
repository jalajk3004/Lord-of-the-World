"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const socket_io_1 = require("socket.io");
function handler(req, res) {
    if (!res.socket.Server.io) {
        console.log("Setting up the websocket connection");
        const io = new socket_io_1.Server(res.socket.Server);
        res.socket.Server.io = io;
        io.on("connection", (socket) => {
            console.log("A user connected");
            socket.on("joinRoom", (roomId) => {
                socket.join(roomId);
                console.log(`User joined room: ${roomId}`);
            });
            socket.on("draw", (data) => {
                socket.to(data.roomId).emit("draw", data);
            });
            socket.on("disconnect", () => {
                console.log("A user disconnected");
            });
        });
    }
    res.end();
}
