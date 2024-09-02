//commonjs
//const express = require('express');
import express from 'express';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadRoutes from './routes/propiedadRoutes.js';
import db from './config/db.js';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

//crear app
const app = express()

//habilitar lectura de datos del formulario
app.use(express.urlencoded({extended: true}));

//habilitar cookie-parser
app.use(cookieParser());
//habilitar CSURF
app.use(csrf({cookie: true}));

//Conexiòn a la BD
try {
    await db.authenticate();
    console.log('Conexion Correcta a la BD')
    db.sync(); //en caso de que la tabla no exista la crea
} catch (error) {
    console.log(error)
    
}

//habilitar pug
app.set('view engine', 'pug')
app.set('views', './views')

//habilitar la carpeta publica
app.use(express.static('public'))

//Rutas (Routes)
app.use('/', appRoutes);
app.use('/auth', usuarioRoutes);
app.use('/', propiedadRoutes);
app.use('/api', apiRoutes)

//definir el puerto del servidor o proyecto
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('El servidor se envuentra ejecutandose en el puerto: ' + port)
});


