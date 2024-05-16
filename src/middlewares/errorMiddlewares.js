import { addLogger } from "../utils/logger.js";


const errorDictionary = {
    PRODUCT_CREATE_ERROR: 'Error al crear un nuevo producto.',
    ADD_TO_CART_ERROR: 'Error al agregar un producto al carrito.',
    CHECKOUT_ERROR:'Error al completar la compra del carrito.',
    UNKNOWN_ERROR: 'Error desconocido.',
    INTERNAL_SERVER_ERROR:'No se pudo obtener los productos.',
    ERROR_404_PRODUCT:'El producto no existe',
    MISSING_FIELDS:'Falta completar campos obligatorios',
    ERROR_DELETE:'El producto no puede borrarse',
    ERROR_CART_ID: 'Error al obtener carrito por ID',
    ERROR_DELETE_PRODUCT_TO_CART: 'Error al eliminar producto del carrito',
    ERROR_UPDATE_CART_PRODUCTS:'Error al actualizar carrito con arreglo de productos',
    ERROR_UPDATE_PRODUCTS_QUANTITY:'Error al actualizar cantidad de ejemplares de un producto en el carrito',
    ERROR_DELETE_PRODUCTS_TO_CART:'Error al eliminar todos los productos del carrito',
    ERROR_CREATE_CART:'Error al crear un nuevo carrito',
    ERROR_GET_PRODUCT_ID:'Error al obtener el producto por ID: ${id}',
    ERROR_UPDATE_PRODUCT_ID: 'El producto con ID ${productId} no existe',
    ERROR_CREATE_TICKET: 'Error al crear un nuevo ticket',
    ERROR_UPDATE_STOCK_PRODUCT:'Error al actualizar el stock del producto',
    ERROR_TOKEN:'token invalido, error',
    UNAUTHORIZED:'Usuario no autorizado para esta tarea'
};

function errorHandler(err, req, res, next) {
    const errorCode = err.code || 'UNKNOWN_ERROR';
    const errorMessage = errorDictionary[errorCode] || 'Error desconocido.';
    /* Obtiene el logger */
    const logger = req.logger;

    /* Registra el error  */
    /* logger.error(`Error: ${errorMessage}`, {error: 'Error registrado' }); */

    /* Enviar una respuesta según el entorno */ 
    if (process.env.NODE_ENV === 'prod') {
        res.status(500).json({ error: 'Error desconocido.' });
        logger.error('Este es un mensaje de error');
    } else {
        res.status(500).json({ error: errorMessage });
        logger.error('Este es un mensaje de error');
    }
}

export default errorHandler;

