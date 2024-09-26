const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const crypto = require('crypto');
const path = require('path'); // Asegúrate de importar 'path'
const cloudinary = require('../config/cloudinary'); // Ajusta la ruta según sea necesario

// Configuración de almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Cambia esto al nombre de la carpeta que desees
        allowed_formats: ['jpg', 'png', 'jpeg'],
        filename: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
            const ext = path.extname(file.originalname); // Aquí usamos path
            const basename = path.basename(file.originalname, ext);
            return `${uniqueSuffix}-${basename}${ext}`; // Nombre del archivo único
        },
    },
});

// Configuración de filtros para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceptar imagen
    } else {
        cb(new Error('No es un archivo de imagen'), false); // Rechazar archivo no imagen
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de tamaño de archivo a 5 MB
});

module.exports = upload;




