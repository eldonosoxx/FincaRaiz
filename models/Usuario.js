import { DataTypes } from "sequelize";
import db from '../config/db.js';
import bcrypt from 'bcrypt';

const Usuario = db.define('usuarios', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: DataTypes.STRING,
    confirm: DataTypes.BOOLEAN
}, {
    hooks: {
        beforeCreate: async function(usuario) {
            //cuando se oprime el boton crear pasa por este proceso
            const salt = await bcrypt.genSalt(10)
            //reescribe el valor antes de cargarlo a la BD
            usuario.password = await bcrypt.hash(usuario.password, salt);
        }
    },
    
    scopes: {
        eliminarPassword: {
            atributes: {
                exclude: ['password', 'token', 'confirmado', 'createdAt', 'updatedAt']
            }
        }
    }

})

/**Metodos Personalizado comparar password hasheado con texto plano */
Usuario.prototype.verificarPassword = function(password) { //password que el usuario ingresa
    return bcrypt.compareSync(password, this.password); //se compara el password con el de la BD (this.password)
}

export default Usuario;
