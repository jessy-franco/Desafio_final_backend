
import cartRepository from '../repositories/cartRepository.js';
import productService from '../services/productService.js'; // Servicio para interactuar con el producto
import ticketService from '../services/ticketService.js'; // Servicio para generar tickets de compra
import errorHandler from "../middlewares/errorMiddlewares.js"


const cartsController = {
    createCart: async (req, res) => {
        try {
            const cart = await cartRepository.createCart();
            res.status(201).send(cart);
        } catch (error) {
            console.error("Error al crear un nuevo carrito:", error);
            /* res.status(500).send("Error del servidor"); */
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    getCartById: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const cart = await cartRepository.getCartById(cartId);
            res.render("cart", {
                cart,
                styles: "cartStyle.css",
            });
        } catch (error) {
            console.error("Error al obtener carrito por ID:", error);
            /* res.status(500).send("Error del servidor"); */
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    addProductToCart: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const quantity = req.body.quantity;

            // Obtener el usuario actual desde req.user
            const currentUser = req.user;
            // Verificar si el producto pertenece al usuario actual
        const productBelongsToUser = await productService.productBelongsToUser(productId, currentUser);

            // Verificar si el usuario es premium
        if (currentUser.premium === true && productBelongsToUser) {
            return res.status(403).json({ message: 'No puedes agregar tu propio producto al carrito.' });
        }

        // Si el producto no pertenece al usuario premium, agregarlo al carrito
        await cartRepository.addProductToCart(cartId, productId, quantity);
        res.redirect("/api/cart/" + cartId);
            
        } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
            /* res.status(500).send("Error del servidor"); */
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
            /* res.status(500).send("Error del servidor"); */
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
            /* res.status(500).send("Error del servidor"); */
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    clearCart: async (req, res) => {
        try {
            const cartId = req.params.cid;
            await cartRepository.clearCart(cartId);
            res.status(204).send
        } catch (error) {
            console.error("Error al eliminar todos los productos del carrito:", error);
            /* res.status(500).send("Error del servidor"); */
            errorHandler({ code: 'ERROR_DELETE', message: error.message }, req, res);
        }
    },
    // Función para completar el proceso de compra del carrito
    completePurchase: async (req, res) => {
        try {
            const cartId = req.params.cid;
            const cart = await cartRepository.getCartById(cartId);

            // Verificar el stock de cada producto en el carrito al momento de la compra
            const productsToPurchase = [];

            for (const item of cart.products) {
                const product = await productService.getProductById(item.productId);
                if (product.stock >= item.quantity) {
                    // Si hay suficiente stock, restar la cantidad comprada del stock del producto
                    await productService.updateProductStock(product._id, product.stock - item.quantity);
                    productsToPurchase.push(item);
                }
            }

            // Generar un ticket con los productos comprados
            const ticket = await ticketService.generateTicket(productsToPurchase);

            // Filtrar los productos que no pudieron comprarse (por falta de stock)
            const productsNotPurchased = cart.products.filter(item => !productsToPurchase.some(p => p.productId === item.productId));

            // Actualizar el carrito con los productos que no pudieron comprarse
            await cartRepository.updateCartProducts(cartId, productsNotPurchased);

            res.status(200).json({
                message: "Compra completada con éxito",
                ticket,
                productsNotPurchasedIds: productsNotPurchased.map(item => item.productId)
            });
        } catch (error) {
            console.error("Error al completar la compra del carrito:", error);
            /* res.status(500).send("Error del servidor"); */
            errorHandler({ code: 'CHECKOUT_ERROR', message: error.message }, req, res);
        }
    },

};

export default cartsController;
