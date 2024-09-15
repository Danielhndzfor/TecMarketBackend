const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configuración de almacenamiento en Multer
const storage = multer.diskStorage({
    // Definir la carpeta de destino para guardar los archivos
    destination: (req, file, cb) => {
        cb(null, 'uploads');  // Guarda todas las imágenes en la carpeta 'uploads'
    },
    // Definir el nombre del archivo guardado
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        const newFilename = `${uniqueSuffix}-${basename}${ext}`;
        console.log('Archivo guardado como:', newFilename);  // Imprime el nombre del archivo
        cb(null, newFilename);
    }
    
});

// Configuración de filtros para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);  // Aceptar imagen
    } else {
        cb(new Error('No es un archivo de imagen'), false);  // Rechazar archivo no imagen
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log('Archivo recibido:', file);  // Depuración
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);  // Aceptar imagen
        } else {
            console.log('Archivo rechazado, no es una imagen');  // Depuración
            cb(new Error('No es un archivo de imagen'), false);  // Rechazar archivo no imagen
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }  // Limite de tamaño de archivo a 5 MB
});


module.exports = upload;


