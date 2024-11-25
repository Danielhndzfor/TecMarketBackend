const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const crypto = require('crypto');
const path = require('path');
const cloudinary = require('../config/cloudinary'); // Ajusta la ruta según sea necesario

// Configuración de almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Carpeta en Cloudinary
        transformation: [
            {
                width: 1024, // Dimensiones máximas
                height: 1024,
                crop: 'limit', // Mantener proporciones originales
                quality: 'auto', // Optimizar calidad automáticamente
            },
        ],
        filename: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
            const ext = path.extname(file.originalname); // Extensión original
            const basename = path.basename(file.originalname, ext);
            return `${uniqueSuffix}-${basename}${ext}`; // Nombre único del archivo
        },
    },
});

// Configuración de filtros para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Aceptar cualquier tipo de imagen
    } else {
        cb(new Error('No es un archivo de imagen'), false); // Rechazar otros tipos de archivos
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // Límite de tamaño de archivo en 10 MB
});

module.exports = upload;
