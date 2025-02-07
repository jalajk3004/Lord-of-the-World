import { Server } from "socket.io";

export default function handler(req:any , res:any ) {
  if (!res.socket.Server.io) {
    console.log("Setting up the websocket connection");
    const io = new Server(res.socket.Server);
    res.socket.Server.io = io;

    io.on("connection", (socket) => {
      console.log("A user connected");

      socket.on("joinRoom", (roomId: string) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
      });

      socket.on("draw", (data: { roomId: string; x: number; y: number }) => {
        socket.to(data.roomId).emit("draw", data);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected");
      });
    });
  }
  res.end();
}
