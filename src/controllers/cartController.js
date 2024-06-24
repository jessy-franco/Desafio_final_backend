import CartRepository from '../repositories/cartRepository.js';
import productService from '../services/productService.js';
import ticketService from '../services/ticketService.js';
import Ticket from '../daos/models/ticket.Schema.js'
import errorHandler from "../middlewares/errorMiddlewares.js"
import { logger } from '../utils/logger.js';
import ProductRepository from '../repositories/productsRepository.js';

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();

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
            // Verificar si la sesión del usuario está definida
            if (!req.session || !req.session.user) {
                console.error("Error: La sesión del usuario no está definida.");
                req.session.destroy();
                return res.redirect("/login?Tu_sesión_ha_expirado. Inicia_sesión_nuevamente");
            }

            // Obtener el cartId de los parámetros de la ruta
            const cartId = req.params.cid;
            if (!cartId) {
                return res.status(400).send('ID de carrito no proporcionado');
            }

            // Obtener el carrito de la base de datos
            const cart = await cartRepository.getCartById(cartId);
            if (!cart) {
                return res.status(404).send('Carrito no encontrado');
            }

            // Renderizar la vista del carrito
            res.render("carts2", {
                cartId,
                style: "style.css",
                products: cart.products,
            });

        } catch (error) {
            console.error("Error al obtener carrito por ID:", error);
            res.status(500).send("Error interno del servidor");
        }
    },


    addProductToCart: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const quantity = parseInt(req.body.quantity, 10) || 1;

            console.log("carrito params:", req.params.cid)

            let cart = await cartRepository.getCartById(cartId);

            const existingProductIndex = cart.products.findIndex(product => product.productId.toString() === productId);

            if (existingProductIndex !== -1) {
                const existingQuantity = cart.products[existingProductIndex].quantity;
                console.log("Existing quantity:", existingQuantity);
                cart.products[existingProductIndex].quantity += quantity - 1;
            }
            else {
                const product = await productRepository.getProductById(productId);
                console.log(product)

                const cartQuantity = quantity || 1; // Get quantity from request body or default to 1
                const adjustedQuantity = cartQuantity - 1;


                cart.products.push({ productId, title: product.title, adjustedQuantity, price: product.price, });
            }

            await cart.save();
            const currentUser = req.user;

            if (!currentUser) {
                return res.status(401).json({ message: 'Usuario no autenticado.' });
            }

            const productBelongsToUser = await productService.productBelongsToUser(productId, currentUser._id, req, res);

            if (currentUser.premium === true && productBelongsToUser) {
                return res.status(403).json({ message: 'No puedes agregar tu propio producto al carrito.' });
            }



            await cartRepository.addProductToCart(cart, productId, quantity);

            cart = await cartRepository.getCartById(cartId);

            return res.redirect("/api/products/?Se_agrego_un__producto_al_carrito_con_exito");
            /* return res.status(200).json({ message: 'Product added to cart', cart}); */


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
            let totalAmount = 0;

            for (const item of cart.products) {
                const product = await productService.getProductById(item.productId, req, res);
                if (product.stock >= item.quantity) {
                    await productService.updateProductStock(product._id, product.stock - item.quantity, req, res);
                    totalAmount += item.price * item.quantity;
                    productsToPurchase.push(item);
                } else {
                    // Si no hay suficiente stock, agregar a productos no comprados
                    console.log(`Producto ${product.title} no comprado debido a stock insuficiente.`);
                }
            }

            // Verifica que totalAmount sea un número válido
            if (typeof totalAmount !== 'number') {
                logger.error('El monto total no es un número válido.');
            }

            // Generar ticket solo si hay productos comprados
            let ticket = null;
            if (productsToPurchase.length > 0) {
                ticket = await ticketService.generateTicket(totalAmount, req.session.user.email);

                const productsNotPurchased = cart.products.filter(item => !productsToPurchase.some(p => p.productId === item.productId));

                await cartRepository.updateCartProducts(cartId, productsNotPurchased);

                // Renderizar la vista de compra completada
                res.render("purchaseCompleted", {
                    message: "Compra completada con éxito",
                    ticket,
                    productsNotPurchasedIds: productsNotPurchased.map(item => item.productId)
                });

            }
        } catch (error) {
            console.error("Error al completar la compra del carrito:", error);
            errorHandler({ code: 'CHECKOUT_ERROR', message: error.message }, req, res);

        }
    }
}
export default cartsController;
