import Usuario from '../models/Usuario.js';
import { check,  validationResult } from 'express-validator';
import { generarJWT, generaId } from '../helpers/tokens.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js';
import bcrypt from 'bcrypt';
//import jwt from 'jsonwebtoken';


//formulario de logueo
const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: "Inicio Sesion",
        csrfToken: req.csrfToken()
    })
};

/**autenticar o validar el formulario*/

const autenticar = async (req, res) => {
    //console.log('autenticando....');
      /**validando */
   await check('email').isEmail().withMessage('ElEmail es obligatorio').run(req)
   await check('password').notEmpty().withMessage('El password es obligatorio').run(req)

   let resultado = validationResult(req)
   
    /*****validar el resultado no este vacio*****/
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    //Comprobar si el Usuario existe

    const { email, password } = req.body;
    
    const usuario = await Usuario.findOne({where: { email }})
    if(!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario No Existe'}]
        })
    }

    //Comprobar si el Usuario si esta confirmado.

    if(!usuario.confirm){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario No Ha Sido Confirmado'}]
        })
    }

    /**Revisar el Password*/
     if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Password es Incorrecto'}]
        })
    }

    //Autenticar el Usuario
   /** const token = jwt.sign({ //información que se quiere colocar con jwt
        nombre:'Jose',
        empres: 'Sena',
        Tecnologia: 'Node.js'
    }, 'palabraSupersecretasssss', {
        expiresIn: '1d'
    })
    console.log(token);*/
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre})
    console.log(token);

    //Almacenar en un Cookie
    return res.cookie('_token', token, {
        httpOnly: true, //evita los ataques cross, no ser accesile desde la appi de javascript
        secure:true, 
        sameSite: true

    }).redirect('/mispropiedades')
}


/**Formulario de REGISTRO */
const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken() //reenvio del token publico para ser comprobado con el privado
    })
};

/**Funcion para validar el registro*/
const registrar = async (req, res) =>{
  // console.log('Registrando...');
    //Validar Campos
    await check('nombre').notEmpty().withMessage('Nombre Obligatorio').run(req);
    await check('email').isEmail().withMessage('No tiene formato de correo').run(req);
    await check('password').isLength({min: 6}).withMessage('El Mìnimo para el pass es de (6)').run(req);
    await check('repetir_password').equals(req.body.password).withMessage('las contraseñas no son iguales').run(req);

    let resultado = validationResult(req);

    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    const { nombre, email, password } = req.body;
    //verificar que el usuario no exista
    const existeUsuario = await Usuario.findOne({ where : { email }})
    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Usuario Ya Existe' }]
        })
    }

    const usuario =  await Usuario.create({
        nombre,
        email,
        password,
        token: generaId(),
    })

    //envia email de confirmaciòn
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    //Mensaje de confirmaciòn cuando se crea el Usuario
    res.render('templates/mensaje', {
        pagina: 'Registro Exitoso',
        mensaje: 'Se ha enviado una cofirmacion, presione en el enlace'
    })

};

//Función que permite confirmar la cuenta
const confirmar = async (req, res) => {
    const { token } = req.params;

    //Verificar si el tojen es válido
    const usuario = await Usuario.findOne({ where: {token}})

    if(!usuario){
        return res.render('auth/confirmarCuenta', {
            pagina: 'Error al confirmar cuenta',
            mensaje: 'Hubo un error en la confirmación de la cuenta, intente de nuevo',
            error: true
        })
    }
    //Si no hay error se confirma la cuenta en la BD
    usuario.token = null;
    usuario.confirm = true;
    await usuario.save();

    res.render('auth/confirmarCuenta', {
        pagina: 'Cuenta Confirmada!',
        mensaje: 'La Cuenta se Confirmó Correctamente'
    })
}

//funcion del formulario que muestra la vista
const olvidePassword = (req, res) => {
        res.render('auth/olvidepassword', {
        pagina: 'Recuper Password',
        csrfToken: req.csrfToken()

    })
};

//funcion del post
const resetPassword = async (req, res) => {
    await check('email').isEmail().withMessage('No tiene formato de correo').run(req);
   
    let resultado = validationResult(req);

    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
       return res.render('auth/olvidepassword', {
            pagina: 'Recuper Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
    
        })
    }

    /**Buscar el Usuario**/
    //se extrae el email
    const { email } = req.body;
    const usuario = await Usuario.findOne({where: {email}});
    //console.log(usuario)

    //en caso de que no exista el usuario
    if(!usuario){
       return res.render('auth/olvidepassword', {
            pagina: 'Recuper Password',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El email no pertenece a ningún Usuario'}]
    
        })
    }

    /**Generar nuevo el Token y enviar email */
    usuario.token = generaId();
    await usuario.save();

    /**email de olvide password
    Enviar Email, se pasa el objeto con todos los datos*/
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token 
    })

    //  Mostrar Mensaje de Confirmación, renderizar
    res.render('templates/mensaje', {
        pagina: 'Reestablece la contraseña',
        mensaje: 'Se ha enviado un email con las instrucciones'
    })
       
}

//funcion para comprobar el token
const comprobarToken = async (req, res) => {
    const {token} = req.params;

    //se busca el token que este registrado en la BD
    const usuario = await Usuario.findOne({where: {token}})
        if(!usuario){
            return res.render('auth/confirmarCuenta', {
                pagina: 'Reestablecer password',
                mensaje: 'Hubo un error al reestablecer tu contraseña, intenta de nuevo',
                error: true
            })
        }
    //si el usuario es valido Mostrar formulario para modificar Password
    res.render('auth/resetPassword', {
    pagina: 'Reestablece el password',
    csrfToken: req.csrfToken(),

    })

   
}
 
//funcion para el nuevo password
const nuevoPassword = async (req, res) => {
    await check('password').isLength({min: 6}).withMessage('la contraseña no puede ser menor a 6 caracteres').run(req);
    
    let resultado = validationResult(req)
    //res.json(resultado.array());

    //return res.json(resultado.array())

    /*****validar la contraseña no este vacio*****/
    if(!resultado.isEmpty()){
        //Errores
        return res.render('auth/resetPassword', {
            pagina: 'Reestablece el Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
           
        })
    }
     //se extraen el password y el token
     const {token} = req.params;
     const {password} = req.body; 

      //Identifica que Usuario esta pidiendo el Cambio
    const usuario = await Usuario.findOne({where: {token}});

    //hashear el password
    const salt =  await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null; //se pone el token en null

    await usuario.save(); //se salva el usuario

    res.render('auth/confirmarCuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El Password se guardo correctamente'
    })

}

const cerrarSesion = async (req, res)=> {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}
    

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    olvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    cerrarSesion
    
    
};