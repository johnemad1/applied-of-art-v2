require('dotenv').config();
const path = require('path');

//middlewares
const notFound = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

//DB
const connectDB = require('./db/connect');
// Cleanup
const cleanup = require('./cleaner');

// Express packages
const express = require('express');
const app = express();
require('express-async-errors');

//other packages
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

//routers
const departmentRouter = require('./routes/departmentRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const memberRouter = require('./routes/memberRoutes');
const uploadRouter = require('./routes/uploadsRoutes');
const researchRouter = require('./routes/researchRoutes');
const eventsRouter = require('./routes/eventsRoutes');
const newsRouter = require('./routes/newsRoutes');
const schedulesRouter = require('./routes/scheduleRoutes');

app.use(
  cors({
    // origin: 'https://faculty-of-applied-arts.netlify.app', // your frontend URL
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // credentials: true, // Allow credentials (cookies, authorization headers, etc.)

     origin: 'http://localhost:3000',
     credentials: true,
  }),
);
// compress all responses
// app.use(compression());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    'Too many accounts created from this IP, please try again after an hour',
});

app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(morgan('dev'));

//routes
app.use('/api/v1/departments', departmentRouter);
app.use('/api/v1/research', researchRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/members', memberRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/uploads', uploadRouter);
app.use('/api/v1/schedules', schedulesRouter);

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT;

const start = async () => {
  //cleanup();
  await connectDB(process.env.MONGO_URL, console.log('connected to DB'));
  app.listen(port, () => console.log(`Starting server on port ${port}`));
};

start();
