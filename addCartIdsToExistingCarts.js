const mongoose = require('mongoose');
const Category = require('./models/Category'); // Asegúrate de que la ruta sea correcta

const removeCategoryIdFromAllCategories = async () => {
    try {
        // Conéctate a la base de datos (ajusta la URI según tu configuración)
        await mongoose.connect('mongodb+srv://danielhernandezfor:AdTJsYxj9KdhiOqg@tecmarket.qjc0m.mongodb.net/?retryWrites=true&w=majority&appName=TecMarket', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Actualiza todos los documentos de la colección `Category` para eliminar el campo `categoryId`
        const result = await Category.updateMany(
            {}, // Sin filtro, actualiza todos los documentos
            { $unset: { categoryId: "" } } // Elimina el campo `categoryId`
        );

        console.log(`Se eliminaron ${result.modifiedCount} categoryId(s) de todas las categorías.`);

    } catch (error) {
        console.error('Error al eliminar categoryId:', error.message);
    } finally {
        // Cierra la conexión a la base de datos
        mongoose.connection.close();
    }
};

// Llama a la función
removeCategoryIdFromAllCategories();

