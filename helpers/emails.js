import nodemailer from 'nodemailer';

const emailRegistro = async(datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
});
    const { nombre, email, token } = datos;
    //enviar el email al servidor
    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirme su cuenta en Finca Raiz',
        text: 'Confirme su cuenta en Finca Raiz',
        html: `
                <p> Hola ${nombre}, confirme su cuenta </p>
                <p> tu cuenta ya esta disponible oprima el enlace:
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirme su Cuenta</a></p>

            `
    })
}
const emailOlvidePassword = async(datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
  
        const {email, nombre, token} = datos
        //se envia el email
        await transport.sendMail({
          from: 'BienesRaicese.com',
          to:email,
          subject: 'Restablece  la contraseña para FincaRaiz.com',
          text: 'Restablece  la contraseña para FincaRaiz.com',
          html:  `
              <p> Hola ${nombre}, has solicitado reestablecer la contraseña en FincaRaiz.com</p>
              <p> sigue el enlace para reestablecer password nuevo:
              <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvidepassword/${token}">Restablecer Password</a> </p>
  
  
              <p>Si no solicitaste recuperar el password, Ignora el Mensaje</p>
              `          
        })
  }

export {
    emailRegistro, 
    emailOlvidePassword
}
