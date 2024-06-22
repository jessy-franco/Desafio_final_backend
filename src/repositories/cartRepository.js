import  CartManager  from "../daos/cartDao.js";
/* import errorHandler from "../middlewares/errorMiddlewares.js" */
import {logger} from "../utils/logger.js"
const cartManager = new CartManager();

class CartRepository{
    async createCart () {
        try {
            return await cartManager.createCart();
        } catch (error) {
            logger.error({ message: error.message });
        }
    };
    
    async saveCart(cart) {
        try {
            await this.cartManager.saveCart(cart);
        } catch (error) {
            console.error("Error al guardar el carrito en la colección 'carts':", error);
        }
    }
    async getCartById(cartId){
        try {
            let cart = await cartManager.getCartById(cartId);
            if (!cart) {
                cart = await cartManager.createCart();
            }
            return cart;
        } catch (error) {
            logger.error("No se pudo agregar el producto al carrito")
        }
    };

    async addProductToCart(cartId, productId, quantity){
        try {
            await cartManager.addProductToCart(cartId, productId, quantity);
        } catch (error) {
            logger.error({ message: error.message })
        }
    };

    async removeProductFromCart(cartId, productId){
        try {
            await cartManager.removeProductFromCart(cartId, productId);
        } catch (error) {
            logger.error({ message: error.message })
        }
    };

    async updateCartProducts(cartId, products) {
        try {
            await cartManager.updateCartProducts(cartId, products);
        } catch (error) {
            logger.error({ message: error.message })
        }
    };

    async updateProductQuantity(cartId, productId, quantity){
        try {
            await cartManager.updateProductQuantity(cartId, productId, quantity);
        } catch (error) {
            logger.error({ message: error.message })
        }
    };

    async clearCart(cartId){
        try {
            await cartManager.clearCart(cartId);
        } catch (error) {
            logger.error({ message: error.message })
        }
    }
};

export default CartRepository;
