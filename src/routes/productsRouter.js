import express from "express";
import productsController from "../controllers/productsController.js";
import { isAdmin, isPremium } from "../middlewares/auth.middleware.js"


const productsRouter = express.Router();

/* ver todos los productos  */
productsRouter.get("/", productsController.getAllProducts);


/* En ruta New, comprueba si es admin directamente en sessionController a la hora del loguin, si no es admin no habilita la vista de la ruta, lo mismo premium */
productsRouter.get("/new", (req, res) => {
    res.render("new-product", {
        style: "new.css",
    });
});

productsRouter.get("/:id", productsController.getProductById);

productsRouter.post("/", productsController.createProduct);

/* ruta para actualizar prod(funcional) */
productsRouter.put("/:_id", isAdmin, productsController.updateProduct);

/* Ruta para eliminar un producto por ID  (funcional)*/
productsRouter.delete("/:_id", isAdmin, productsController.deleteProduct);

productsRouter.get("/manage", /* isAdmin,isPremium, */ productsController.renderManageProductView);

export default productsRouter;
