import express from 'express';
import { formularioLogin, cerrarSesion, autenticar, formularioRegistro, olvidePassword, registrar, confirmar, resetPassword, comprobarToken, nuevoPassword } from '../controller/usuarioController.js';

//Routes
const router = express.Router();

//rutas O END POINTS
router.get('/login', formularioLogin);
router.post('/login', autenticar);

router.post('/cerrarsesion', cerrarSesion);

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);

router.get('/confirmar/:token', confirmar)

router.get('/olvidepassword', olvidePassword);
router.post('/olvidepassword', resetPassword)

//Almacena el Nuevo password y  token
router.get('/olvidepassword/:token', comprobarToken);
router.post('/olvidepassword/:token', nuevoPassword);


export default router;