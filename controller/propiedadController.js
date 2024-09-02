import { unlink } from 'fs/promises';
import { validationResult } from 'express-validator'
//import Precio from '../models/Precio.js';
//import Categoria from '../models/Categoria.js';
import {Precio, Categoria, Propiedad} from '../models/index.js'
import { esVendedor, formatearFecha } from '../helpers/index.js';

const admin = async (req, res) => {

    const {pagina: paginaActual } = req.query

    const expresion = /^[1-9]$/

    if(!expresion.test(paginaActual)){
        return res.redirect('/mispropiedades?pagina=1')
    }

    try{
        const {id} = req.usuario;   

        const limit = 10
        const offset = ((paginaActual * limit) - limit)

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioId : id
                },
                include: [
                    {model: Categoria, as: 'categoria'},
                    {model: Precio, as: 'precio'},
                    {model: Mensaje, as: 'mensaje'},
                ],
            }),
            Propiedad.count({
                where: {
                    usuarioId : id
                }
            })
        ])
        console.log(total);

        res.render('propiedades/admin', {
            pagina: 'Mis propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        })
        
    }catch(error){
        console.log(error)
        res.redirect('/mispropiedades'); // Redirigir en caso de error
    }

    const {id} = req.usuario;

    const propiedades = await Propiedad.findAll({
        where: {
            usuarioId : id
        },
        include: [
           { model: Categoria, as: 'categoria' },
           { model: Precio, as: 'precio' }
        ]
    })
    res.render('propiedades/admin', {
        pagina: 'Mis propiedades',
        propiedades,
        csrfToken: req.csrfToken()
    })
}

//Formulario para crear una propiedad

const crear = async (req, res) =>{

    const [categorias, precios] = await Promise.all([ //se crea un arreglo, el promise.all ejecuta la consulta en simultaneo.
        Categoria.findAll(),  //retorna los valores al arreglo
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}  //se crea un objeto para que no nos marque error sin definir datos
    })
}

const editar = async (req, res)=> {

    //se extrae el id para la url
    const { id } = req.params;

    //validar que la propiedad existe
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }
    
    //validar que el que visita la url es quien creo propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mispropiedades')
    }

    //coonsultar modelo categoria, precio
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad

    })
}


const guardar = async (req, res) => {
    
    // Validación
    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {

        // Consultar Modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios, 
            errores: resultado.array(),
            datos: req.body
        })
    }
   // console.log(req.body);

   // Crear un Registro, se extraen los datos del request.body, se renombre el precioid por precio.

    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body

    const { id: usuarioId } = req.usuario
  
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones, 
            estacionamiento, 
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })

        const {id} = propiedadGuardada

        res.redirect(`/propiedades/agregarImagen/${id}`)

    } catch (error) {
        console.log(error)
    }
}

const agregaImagen = async (req, res) =>{
    const {id} = req.params  //se extrae el id del modelo propiedades

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mispropiedades')
    }

    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mispropiedades')
    }

    // Validar que la propiedad pertenece a quien visita esta página
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() ) {
        return res.redirect('/mispropiedades')
    }
    
    res.render('propiedades/agregarImagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}

const almacenarImagen = async (req, res, next) => {

    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mispropiedades')
    }

    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mispropiedades')
    }

    // Validar que la propiedad pertenece a quien visita esta página
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() ) {
        return res.redirect('/mispropiedades')
    }

    try {
        // console.log(req.file)

        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()

        next()

    } catch (error) {
        console.log(error)
    }
}

const guardarCambios = async (req, res) =>{
    console.log('guardando los cambios');

    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {

        //consultar Modelo de precio y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.finAll(),
            Precio.findAll()
        ])
        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }
    const {id} = req.params;

    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mispropiedades')
    }

    const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body

    propiedad.set({
        titulo,
        descripcion,
        habitaciones,
        estacionamiento,
        wc,
        calle,
        lat,
        lng,
        precioId,
        categoriaId
    })
    await propiedad.save();

    res.redirect('/mispropiedades');
}

const eliminar = async (req, res) => {
    console.log('eliminando...')

    const {id} = req.params;

    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mispropiedades')
    }
    await unlink(`public/uploads/${propiedad.imagen}`);
    console.log(`Se elimino una imagen..${propiedad.imagen}`)

    propiedad.destroy();
    res.redirect('/mispropiedades')
    
}

const mostrarPropiedad = async (req, res) => {
    // console.log('mostrando propiedad')
    // res.send('mostrando propiedad')

    const {id} = req.params;

    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'}
        ]
    })

    if(!propiedad || !propiedad.publicado) {
        return res.redirect('/404');
    }

    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    })
}

const enviarMensaje = async (req, res) => {
    const {id} = req.params

    const propiedad = await Propiedad.findByPk(id, {
        include : [
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'},
        ]
    })

    if(!propiedad){
        return res.redirect('/404')
    }

    let resultado = validationResult(req)

    if(!resultado.isEmpty()){

        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        })
    }
    const {mensaje} = req.body
    const {id: propiedadId} = req.params
    const {id: usuarioId} = req.usuario

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.redirect('/')
}

const verMensajes = async (req, res) => {
    const{id} = req.params

    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Mensaje, as: 'mensajes',
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            },
        ],
    })

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mispropiedades')
    }

    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })


}

const cambiarEstado = async (req, res) => {
    const {id} = req.params;
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }

    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mispropiedades')
    }

    propiedad.publicado = !propiedad.publicado
    await propiedad.save()

    res.json({
        resultado: 'ok'
    })

}

export {
    admin,
    crear,
    guardar,
    agregaImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    cambiarEstado
}