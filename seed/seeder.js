import { exit } from 'node:process'
import categorias from './categorias.js'
import precios from './precios.js'
import usuarios from './usuarios.js'
import db from '../config/db.js'
import { Categoria, Precio, Usuario } from '../models/index.js'

const importarDatos = async () => {
    try {
        // Autenticar  en la BD
        await db.authenticate()

        // Generar las Columnas de la base de datos antes de insertar los datos
        await db.sync()

        // Insertamos los datos con "bulkCreate()"
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)    
            
        ])

        console.log('Datos Importados Correctamente')
        exit(0) //exit(0), indica que sale sin errores.
        
    } catch (error) {
        console.log(error)
        exit(1) //exit(1), indica que hubo algún error
    }
}

const eliminarDatos = async () => {
    try {
        await db.sync({force: true})  //hace un truncate sobre las tablas.
        console.log('Datos Eliminados Correctamente');
        exit()
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "-i") {  //"argv", forma en que se pasar argumentos a un comando, desde la linea de comandos.
    importarDatos();
}

if(process.argv[2] === "-e") {
    eliminarDatos();
}
