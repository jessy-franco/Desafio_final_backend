import ProductDAO from '../daos/productsDao.js'; 
import errorHandler from "../middlewares/errorMiddlewares.js"

const productService = {
    // Función para obtener un producto por su ID
    getProductById: async (productId) => {
        try {
            const product = await ProductDAO.getById(productId);
            return product;
        } catch (error) {
            console.error(`Error al obtener el producto por ID (${productId}):`, error);
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    // Función para actualizar el stock de un producto
    updateProductStock: async (productId, newStock) => {
        try {
            await ProductDAO.updateStock(productId, newStock);
        } catch (error) {
            console.error(`Error al actualizar el stock del producto (${productId}):`, error);
            errorHandler({ code: 'ERROR_UPDATE_STOCK_PRODUCT', message: error.message }, req, res);
            
        }
    },
    // Función para verificar si un producto pertenece a un usuario
    productBelongsToUser: async (productId, userId) => {
        try {
            const product = await ProductDAO.getById(productId);
            return product.owner === userId;
        } catch (error) {
            console.error(`Error al verificar la propiedad del producto (${productId}) para el usuario (${userId}):`, error);
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    }
};

export default productService;
