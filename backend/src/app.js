// create server
import express from 'express';
const app = express();
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import roomRoutes from './routes/room.route.js';
import propertyRoutes from './routes/property.route.js'
import inventoryRoutes from './routes/inventory.routes.js';
import bookingRoutes from './routes/booking.route.js';


// middlewares for json parsing
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// APIs
app.use('/api/v1/', propertyRoutes);


export default app;