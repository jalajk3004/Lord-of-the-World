import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import userRouter from './routes/authroutes';

dotenv.config();
const app = express();
app.use(cors());


// Middleware
app.use(express.json());

app.use('/api/auth', userRouter);

// Define a simple route for testing
app.get('/', (req, res) => {
  res.send('This is a test web page!');
});

// Create HTTP server and attach the Express app
const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

export default httpServer;