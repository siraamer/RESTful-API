const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const Boom = require('./utils/apiError');
const globalError = require('./middleware/errorMiddleware');
const {webhookCheckout} = require('./controllers/orderController');
const dbConnection = require('./database');

dotenv.config({ path: 'config.env' });

// Routes
const mountRoutes = require('./routes');
// Connect with db
dbConnection();

// express app
const app = express();

//Enable CORS
app.use(cors());
app.options('*', cors());

// Compress All Response
app.use(compression());

// checkout webhook
app.post(
  '/checkout-webhook',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
  next(new Boom(`Can't find this route: ${req.originalUrl}`, 400));
});
// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 9000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});
// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
// app
