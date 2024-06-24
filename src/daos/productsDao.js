import Product from "../daos/models/products.schema.js";
import errorHandler from "../middlewares/errorMiddlewares.js"

class ProductDAO {
    static async getAll() {
        return Product.find().lean();
    }

    static async getById(id) {
        return Product.findById(id).lean();
    }

    static async add(productData) {
        try {
            const newProduct = await Product.create(productData);
            return newProduct.toObject();
        } catch (error) {
            console.error("Error al agregar producto en ProductDAO.add:", error);
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    }

    static async getAllWithStock() {
        return Product.find({ stock: { $gt: 0 } }).lean();
    }

    static async update(_id, newData) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(_id, newData, { new: true });
            if (!updatedProduct) {
                errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
            }
            return updatedProduct.toObject();
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            errorHandler({ code: 'ERROR_UPDATE_PRODUCT_ID', message: error.message }, req, res);
        }
    }

    static async remove(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);

            if (!deletedProduct) {
                errorHandler({ code: 'ERROR_DELETE', message: error.message }, req, res);
            }
            
            return deletedProduct.toObject();
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            errorHandler({ code: 'ERROR_DELETE', message: error.message }, req, res);
        }
    }

    static async updateStock(productId, newStock) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                { stock: newStock },
                { new: true }
            ).lean();

            if (!updatedProduct) {
                throw new Error("Producto no encontrado");
            }
            return updatedProduct;
        } catch (error) {
            console.error("Error al actualizar stock en ProductDAO.updateStock:", error);
            errorHandler({ code: 'ERROR_DELETE', message: error.message }, req, res);
        }
    }
    async getProdOwner (owner){
        try {
            return await Product.find({ owner: owner }).lean();
        } catch (error) {
            console.error('Error al obtener productos por owner:', error);
            logger.error(error);
        }
    }

}

export default ProductDAO;
