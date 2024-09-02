import {Dropzone} from "dropzone";

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

Dropzone.options.imagen = {
    dictDefaultMessage: 'Sube tus imágenes aquí',
    acceptedFiles: '.png,.jpg,.jpeg',
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads: 1,
    autoProcessQueue: false,  //obliga a que el usuario oprima el boton de añadir.
    addRemoveLinks: true,
    dictRemoveFile: 'Borrar Archivo',
    dictMaxFilesExceeded: 'El Limite es 1 Archivo',
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen',
    init: function() {
        const dropzone = this
        const btnPublicar = document.querySelector('#publicar')

        btnPublicar.addEventListener('click', function() {
            dropzone.processQueue() //procesa la imagen en el momento en que se oprime el botón
        })
        
        //este evento "queuecomplete" de dropzone se ejecuta cuando se procesa el "processQueue()"
        dropzone.on('queuecomplete', function() {
            //valida cuantos archivos quedan en la cola
            if(dropzone.getActiveFiles().length == 0) {
                //cuando dropzone detecta que se subio todo lo redirecciona a mispropiedades
                window.location.href = '/mispropiedades'
            }
        })

    }

}