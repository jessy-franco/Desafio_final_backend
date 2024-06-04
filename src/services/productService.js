import ProductDAO from '../daos/productsDao.js'; 
import errorHandler from "../middlewares/errorMiddlewares.js"
import { logger } from "../utils/logger.js"

const productService = {
    getProductById: async (productId, req, res) => {
        try {
            const product = await ProductDAO.getById(productId);
            return product;
        } catch (error) {
            console.error(`Error al obtener el producto por ID (${productId}):`, error);
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    updateProductStock: async (productId, newStock, req, res) => {
        try {
            await ProductDAO.updateStock(productId, newStock);
        } catch (error) {
            console.error(`Error al actualizar el stock del producto (${productId}):`, error);
            errorHandler({ code: 'ERROR_UPDATE_STOCK_PRODUCT', message: error.message }, req, res);
        }
    },

    productBelongsToUser: async (productId, userId, req, res) => {
        try {
            const product = await ProductDAO.getById(productId);
            if (!product) {
                logger.error('Product not found');
            }
            return product.owner === userId;
        } catch (error) {
            console.error(`Error al verificar la propiedad del producto (${productId}) para el usuario (${userId}):`, error);
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    }
};

export default productService;
