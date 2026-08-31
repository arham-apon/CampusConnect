const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require("./config/db");
dotenv.config();

const authRoutes = require('./routes/auth.routes.js');
const donorRoutes = require('./routes/donor.routes.js');
const requestRoutes = require('./routes/request.routes.js')
const lostItemsRoutes = require('./routes/LostItem.routes.js')
const roomBookingRoutes = require('./routes/roomBooking.routes.js')
const feedBackRoutes = require('./routes/feedbackRoutes.js')
const societyRoutes = require('./routes/society.routes.js')
const eventRoutes = require('./routes/event.routes.js')
const administratorRoutes = require('./routes/administrator.routes.js')
const marketplaceRoutes = require('./routes/marketplace.routes.js')
const notificationRoutes = require('./routes/notification.routes.js')
const httpproxy = require('http-proxy')


const cookieParser = require('cookie-parser');

const cors = require('cors');
const { auth } = require('firebase-admin');
const initCleanupJob = require('./src/jobs/cleancleanupRequests.js');

const FRONTEND_DEV_URL = 'http://localhost:5173';
const GATEWAY_URL = 'http://localhost:4000';

const allowedOrigins = [FRONTEND_DEV_URL, GATEWAY_URL];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/request', requestRoutes)
app.use('/api/lost-items', lostItemsRoutes)
app.use('/api/bookRoom', roomBookingRoutes)
app.use('/anonymous/api/feedback', feedBackRoutes)
app.use('/api', societyRoutes)
app.use('/api', eventRoutes)
app.use('/api/administrator', administratorRoutes)
app.use('/api/marketplace', marketplaceRoutes)
app.use('/api', notificationRoutes)






const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    connectDB();
    initCleanupJob()
    console.log(`Server running on ${PORT}`);
});
