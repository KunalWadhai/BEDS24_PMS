import express from 'express';
const router = express.Router();

import {createProperty, getProperty} from '../controllers/property.controller.js';

// Property routes
router.post('/properties/create', createProperty);
router.get('/properties/:id', getProperty);

export default router;
