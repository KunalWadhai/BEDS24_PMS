import express from 'express';
const router = express.Router();

import {createProperty, getProperty} from '../controllers/property.controller.js';
import { validateBody } from '../middlewares/validateBody.js';

// Property routes

router.post('/properties', validateBody(['name', 'currency']), createProperty);
router.get('/properties/:id', getProperty);

export default router;
