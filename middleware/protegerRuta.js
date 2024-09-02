import jwt from 'jsonwebtoken'
import { Usuario } from '../models/index.js'


const protegerRuta = async (req, res, next) => {

    //console.log('Redireccionando al middleware');
       
    /****** Verificar si hay un token*****/ 
    const {_token } = req.cookies  //se recupera de cookie el token

    if(!_token) {
        return res.redirect('/auth/login') //en caso de que no exista se retorna al login
    }

    //Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET) //se comprueba que sea el mismo token
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id) //se toma de la BD.
        
       // console.log(usuario)
       //Almacenar el usuario al req.
       if(usuario){
        req.usuario = usuario
       }
       else{
        return res.redirect('/auth/login')
       }
        return next();

    } catch (error) {
        return res.clearCookie('_token').redirect('/auth/login') //En caso de error se redirecciona al login
    }
     
    //next(); //se redirecciona a proteger ruta en caso de no colocarlo sale un mensaje de error buscando middleware.
}

export default protegerRuta;