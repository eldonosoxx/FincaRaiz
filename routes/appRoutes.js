import express from 'express';
import {inicio, categoria, noEncontrado, buscador} from '../controller/appController.js';

const router = express.Router();

router.get('/', inicio);

router.get('/categoria/:id', categoria);

router.get('/404', noEncontrado);

router.get('/buscador', buscador);


export default router;
