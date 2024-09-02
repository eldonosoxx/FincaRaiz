import express from 'express';
import {propiedades} from '../controller/apiController.js';

const router = express.Router()

router.get('/propiedades', propiedades)

export default router;
