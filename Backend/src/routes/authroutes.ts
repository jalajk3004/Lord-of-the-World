import express, { Request, Response } from 'express';
  import { body, validationResult } from 'express-validator';
  import fetchUser from '../middleware/fetchUser';
  import prisma from '../db';
  import bcrypt from 'bcrypt';
  import jwt from 'jsonwebtoken';
  import dotenv from 'dotenv';

  dotenv.config();

const userRouter = express.Router();

// Register Route
userRouter.post(
  '/register',
  [
    body('username', 'Username must be at least 3 characters long').isLength({ min: 3 }),
    body('password', 'Password must be at least 5 characters long').isLength({ min: 5 }),
    body('email', 'Enter a valid email').isEmail(),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username: req.body.username }, { email: req.body.email }],
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username or Email already taken' });
      }

      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create New User
      const newUser = await prisma.user.create({
        data: {
          username: req.body.username,
          email: req.body.email,
          password: secPass,
        },
      });

      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).send('Internal server error');
    }
  }
);

// Login Route
userRouter.post(
  '/login',
  [
    body('username', 'Username must be at least 3 characters long').isLength({ min: 3 }),
    body('password', 'Password cannot be blank').exists(),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Find user
      const user = await prisma.user.findFirst({ where: { username } });

      if (!user) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      res.status(200).json({ message: 'User logged in successfully', token, username: user.username });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).send('Internal server error');
    }
  }
);

// Get User Route
userRouter.post('/getuser', fetchUser, async (req: any, res: any) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Internal server error');
  }
});

// Get User by Username
userRouter.get('/getusername', async (req: any, res: any) => {
  try {
    const username = req.query.username as string;

    if (!username) {
      return res.status(400).json({ error: 'Username is required for search' });
    }

    const user = await prisma.user.findFirst({
      where: { username },
      select: { id: true, email: true, username: true },
    });
    

    if (!user) {
      return res.status(404).json({ error: 'Account Not Found' });
    }

    res.json({ message: 'User found', user });
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default userRouter;