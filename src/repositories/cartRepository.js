import { CartManager } from "../daos/cartDao.js";
import errorHandler from "../middlewares/errorMiddlewares.js"
import {logger} from "../utils/logger.js"
const cartManager = new CartManager();

const cartRepository = {
    createCart: async () => {
        try {
            return await cartManager.createCart();
        } catch (error) {
            logger.error({ message: error.message });
        }
    },

    getCartById: async (cartId) => {
        try {
            let cart = await cartManager.getCartById(cartId);
            if (!cart) {
                cart = await cartManager.createCart();
            }
            return cart;
        } catch (error) {
            errorHandler({ code: 'ERROR_CART_ID', message: error.message }, req, res);
        }
    },

    addProductToCart: async (cartId, productId, quantity) => {
        try {
            await cartManager.addProductToCart(cartId, productId, quantity);
        } catch (error) {
            logger.error({ message: error.message })
        }
    },

    removeProductFromCart: async (cartId, productId) => {
        try {
            await cartManager.removeProductFromCart(cartId, productId);
        } catch (error) {
            errorHandler({ code: 'ERROR_DELETE_PRODUCT_TO_CART', message: error.message }, req, res);
        }
    },

    updateCartProducts: async (cartId, products) => {
        try {
            await cartManager.updateCartProducts(cartId, products);
        } catch (error) {
            errorHandler({ code: 'ERROR_UPDATE_CART_PRODUCTS', message: error.message }, req, res);
        }
    },

    updateProductQuantity: async (cartId, productId, quantity) => {
        try {
            await cartManager.updateProductQuantity(cartId, productId, quantity);
        } catch (error) {
            errorHandler({ code: 'ERROR_UPDATE_PRODUCTS_QUANTITY', message: error.message }, req, res);
        }
    },

    clearCart: async (cartId) => {
        try {
            await cartManager.clearCart(cartId);
        } catch (error) {
            errorHandler({ code: 'ERROR_DELETE_PRODUCTS_TO_CART', message: error.message }, req, res);
        }
    }
};

export default cartRepository;
