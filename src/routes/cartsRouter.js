import express from "express";
import cartsController from "../controllers/cartController.js";
import { isLoggedIn } from "../middlewares/sessionLoginCartId.js";

/* import {isAdmin, isPremium} from "../middlewares/auth.middleware.js" */

const cartsRouter = express.Router();


/* Creación de un nuevo carrito*/
cartsRouter.post("/", cartsController.createCart);

cartsRouter.get("/", isLoggedIn, (req, res) => {
    res.send('Especifica un ID de carrito.');
});

cartsRouter.get("/:cid", isLoggedIn, cartsController.getCartById);


/* Añadir un producto al carrito seleccionado*/
cartsRouter.post("/:cid/products/:pid", cartsController.addProductToCart)

/* Eliminamos un producto del carrito */
cartsRouter.delete("/:cid/products/:pid", cartsController.removeProductFromCart);

/* router para actualizar el carrito */
cartsRouter.put("/:cid", cartsController.updateCartProducts);

/* actualizar la cantidad de productos de un mismo producto */
cartsRouter.put("/:cid/products/:pid", cartsController.updateProductQuantity);

/* eliminar todos los items del carrito  funciona perfecto por postman*/
cartsRouter.delete("/:cid", cartsController.clearCart);

// Nueva ruta para finalizar el proceso de compra del carrito
cartsRouter.post("/:cid/purchase", cartsController.completePurchase);

export default cartsRouter;

