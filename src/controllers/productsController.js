import Product from "../daos/models/products.schema.js";
import ProductRepository from '../repositories/productsRepository.js';

/* import errorHandler from "../middlewares/errorMiddlewares.js"
import Users from "../daos/models/userSchema.js" */

const productRepository = new ProductRepository();


const productsController = {
    getAllProducts: async (req, res) => {
        try {
            let products
            let { limit = 12, page = 1, sort, query, stock } = req.query;
            limit = parseInt(limit);
            page = parseInt(page);
    
            const options = {
                page,
                limit,
                sort: sort ? { price: sort === 'asc' ? 1 : -1 } : null,
                lean: true
            };
            // Construir el objeto de filtro basado en la consulta
            const filter = query ? { category: query } : {};
    
            // Aplicar el filtro de stock si se proporciona
            if (stock === 'true') {
                products = await productRepository.getAllProducts();
            } 
            
            
            // Ejecutar la consulta utilizando el método de paginación
            const result = await Product.paginate(filter, options);
    
            // Construir los enlaces de paginación
            const pagination = {
                currentPage: result.page,
                totalPages: result.totalPages,
                prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : '',
                nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : '',
                isValid: !(page <= 0 || page > result.totalPages)
            };
            const user = req.session.user;
            // Incluir productos y paginación en el contexto para todos los usuarios
            const context = {
                products: result.docs,
                pagination,
                user,
                isAdmin: user && user.role === "admin",
                style: "products.css"
            };

            console.log(context);

            res.render("products", context);
            
            
        } catch (error) {
            console.error("Error al obtener productos:", error);
            res.status(500).json({ status: 500, error: "Internal Server Error" });
        }
    },

    getProductById: async (req, res) => {
        try {
            const id = req.params.id;
            const product = await productRepository.getProductById(id);
            
            if (!product) {
                res.status(404).send("El producto no existe");
                return;
            }

            res.render("product", {
                title: product.title,
                description: product.description,
                code: product.code,
                price: product.price,
                isStock: product.stock > 0,
                category: product.category,
                thumbnails: product.thumbnails,
                style: "style.css"
            });

        } catch (error) {
            console.error("Error al obtener el producto por ID:", error);
            res.status(500).send("Error interno del servidor");
            // Manejar errores generales aquí si es necesario
        }
    },

    createProduct: async (req, res) => {
        try {
            const {
                title,
                description,
                code,
                price,
                stock,
                category,
                thumbnails,
                owner // ¿De dónde proviene este campo owner en la solicitud? Asegúrate de manejarlo adecuadamente.
            } = req.body;

            // Aquí deberías validar y procesar la propiedad `owner` según tu lógica de negocio
            
            // Verifica si todos los campos obligatorios están presentes
            if (title && description && code && price && stock && category) {
                const newProduct = {
                    title,
                    description,
                    code,
                    price,
                    stock,
                    category,
                    thumbnails: thumbnails || [],
                    owner: owner || 'admin' // Asegúrate de que `owner` tenga un valor válido si no se proporciona en la solicitud
                };

                await productRepository.createProduct(newProduct);

                // Redirige al usuario al formulario de creación de productos
                res.redirect("/api/products/");
                
            } else {
                res.status(400).send("Falta completar campos obligatorios");
            }

        } catch (error) {
            console.error("Error al crear un nuevo producto:", error);
            res.status(500).send("Error interno del servidor");
            // Manejar errores generales aquí si es necesario
        }
    },

    updateProduct: async (req, res) => {
        try {
            const pid = req.params._id;
            const updatedFields = req.body;

            // Validar que el producto exista antes de actualizar
            const product = await productRepository.getProductById(pid);
            if (!product) {
                res.status(404).send("El producto no existe");
                return;
            }

            // Verificar si el usuario es admin o si el producto le pertenece
            if (req.user.role === 'admin' || product.owner === req.user.email) {
                const updatedProduct = await productRepository.updateProduct(pid, updatedFields);

                if (updatedProduct) {
                    res.redirect(`/api/products/${pid}`);
                } else {
                    res.status(404).send("El producto no pudo ser actualizado");
                }
            } else {
                res.status(403).send("Acción no autorizada");
            }

        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            res.status(500).send("Error interno del servidor");
            // Manejar errores generales aquí si es necesario
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const pid = req.params._id;

            // Validar que el producto exista antes de eliminar
            const product = await productRepository.getProductById(pid);
            if (!product) {
                res.status(404).send("El producto no existe");
                return;
            }

            // Verificar si el usuario es admin o propietario del producto (PREMIUM)
            if (req.user.role === 'admin' || product.owner === req.user.email) {
                const deletedProduct = await productRepository.deleteProduct(pid);

                if (deletedProduct) {
                    res.status(200).json({ message: "Producto eliminado correctamente", deletedProduct });
                } else {
                    res.status(404).send("El producto no pudo ser eliminado");
                }
            } else {
                res.status(403).send("Acción no autorizada");
            }

        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            res.status(500).send("Error interno del servidor");
            // Manejar errores generales aquí si es necesario
        }
    },
};

export default productsController;

