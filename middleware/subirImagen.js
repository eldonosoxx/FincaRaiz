import multer from 'multer'
import path from 'path'
import { generaId } from '../helpers/tokens.js'

const storage = multer.diskStorage({
    destination: function(req, file, cb) { //se hace un callback para la imagen
        cb(null, './public/uploads/')
    },
    filename: function(req, file, cb) {
        //se reescribe el nombre de la imagen con el generarId pero se conserva la extensión
        cb(null, generaId() + path.extname(file.originalname) ) 
    }
})

const upload = multer({ storage })

export default upload