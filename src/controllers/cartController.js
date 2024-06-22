import CartRepository from '../repositories/cartRepository.js';
import productService from '../services/productService.js';
import ticketService from '../services/ticketService.js';
import errorHandler from "../middlewares/errorMiddlewares.js"
import { logger } from '../utils/logger.js';


const cartRepository = new CartRepository();

const cartsController = {
    createCart: async (req, res) => {
        try {
            const cart = await cartRepository.createCart();
            res.status(201).send(cart);
        } catch (error) {
            console.error("Error al crear un nuevo carrito:", error);
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },


    getCartById: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const cart = await cartRepository.getCartById(cartId);
            if (!cart) {
                return res.status(404).send('Carrito no encontrado');
            }
            res.status(200).send(cart);
        } catch (error) {
            console.error("Error al obtener carrito por ID:", error);
            logger.error(error)
        }
    },

    addProductToCart: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const quantity = parseInt(req.body.quantity, 10) || 1; 

            console.log("carrito params:", req.params.cid)

            let cart = await cartRepository.getCartById(cartId);
            // Check if the product already exists in the cart
            const existingProductIndex = cart.products.findIndex(product => product.productId.toString() === productId);

            if (existingProductIndex !== -1) {
                // Update the quantity of the existing product
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                // Add a new product to the cart if it doesn't exist
                cart.products.push({ productId, quantity });
            }

            await cartRepository.updateCartProducts(cart);


            /* const currentUser = req.user; */

            /* if (!currentUser) {
                return res.status(401).json({ message: 'Usuario no autenticado.' });
            }

            const productBelongsToUser = await productService.productBelongsToUser(productId, currentUser._id, req, res);

            if (currentUser.premium === true && productBelongsToUser) {
                return res.status(403).json({ message: 'No puedes agregar tu propio producto al carrito.' });
            } */
            


            await cartRepository.addProductToCart(cart, productId, quantity);

            // Recarga el carrito después de agregar el producto para obtener la lista actualizada de productos
            cart = await cartRepository.getCartById(cartId);

            return res.status(200).json({ message: 'Product added to cart', cart })


            /*  res.render("cart",{
             cartId: cartId,
             style: "cart.css"}
             ) */

        } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
            errorHandler({ code: 'ADD_TO_CART_ERROR', message: error.message }, req, res);
        }
    },

    removeProductFromCart: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            await cartRepository.removeProductFromCart(cartId, productId);
            res.status(204).send();
        } catch (error) {
            console.error("Error al eliminar producto del carrito:", error);
            errorHandler({ code: 'ERROR_DELETE', message: error.message }, req, res);
        }
    },

    updateCartProducts: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const products = req.body.products;
            await cartRepository.updateCartProducts(cartId, products);
            res.status(204).send();
        } catch (error) {
            console.error("Error al actualizar carrito con arreglo de productos:", error);
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    updateProductQuantity: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const quantity = req.body.quantity;
            await cartRepository.updateProductQuantity(cartId, productId, quantity);
            res.status(204).send();
        } catch (error) {
            console.error("Error al actualizar cantidad de ejemplares de un producto en el carrito:", error);
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    clearCart: async (req, res) => {
        try {
            const cartId = req.params.cid;
            await cartRepository.clearCart(cartId);
            res.status(204).send();
        } catch (error) {
            console.error("Error al eliminar todos los productos del carrito:", error);
            errorHandler({ code: 'ERROR_DELETE', message: error.message }, req, res);
        }
    },

    completePurchase: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const cart = await cartRepository.getCartById(cartId);

            const productsToPurchase = [];

            for (const item of cart.products) {
                const product = await productService.getProductById(item.productId, req, res);
                if (product.stock >= item.quantity) {
                    await productService.updateProductStock(product._id, product.stock - item.quantity, req, res);
                    productsToPurchase.push(item);
                }
            }

            const ticket = await ticketService.generateTicket(productsToPurchase);

            const productsNotPurchased = cart.products.filter(item => !productsToPurchase.some(p => p.productId === item.productId));

            await cartRepository.updateCartProducts(cartId, productsNotPurchased);

            res.status(200).json({
                message: "Compra completada con éxito",
                ticket,
                productsNotPurchasedIds: productsNotPurchased.map(item => item.productId)
            });
        } catch (error) {
            console.error("Error al completar la compra del carrito:", error);
            errorHandler({ code: 'CHECKOUT_ERROR', message: error.message }, req, res);
        }
    },
}

export default cartsController;
