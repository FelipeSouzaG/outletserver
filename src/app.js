import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/dbConnect.js';
import manipulator404 from './middlewares/manipulator404.js';
import manipulatorError from './middlewares/manipulatorError.js';
import routes from './routes/index.js';

const app = express();

let isDBConnected = false;

const initializeApp = async () => {
  if (!isDBConnected) {
    try {
      await connectDB();
      isDBConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection error:', error);
      process.exit(1);
    }
  }
};

initializeApp();

app.use(async (req, res, next) => {
  if (!isDBConnected) {
    await initializeApp();
  }
  next();
});

const corsOptions = {
  origin: ['https://outletbarreiro.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

routes(app);

app.use(manipulator404);
app.use(manipulatorError);

export default app;
