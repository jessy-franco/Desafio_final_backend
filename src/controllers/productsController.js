import Product from "../daos/models/products.schema.js";
import ProductRepository from '../repositories/productsRepository.js';
import { nodemailerService } from '../utils/nodemailer.js';
import Users from "../daos/models/userSchema.js"

const productRepository = new ProductRepository();
/* const cartRepository = new CartRepository(); */

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
            let cartId = null;
            if (req.session.user) {
                cartId = req.session.user.cartId; // Retrieve cartId from session if logged in
            }
            // Incluir productos y paginación en el contexto para todos los usuarios
            const context = {
                products: result.docs,
                pagination,
                user,
                cartId,
                isAdmin: user && user.role === "admin",
                isPremium: user && user.role === "premium",
                style: "products.css"
            };

            /* console.log(context); */

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
            let cartId = null;
            if (req.session.user) {
                cartId = req.session.user.cartId;
            }

            if (!req.session || !req.session.user) {
                console.error("Error: La sesión del usuario no está definida.");
                /* return res.status(401).send("La sesión ha expirado o no está definida. Por favor, inicie sesión nuevamente."); */
                req.session.destroy();
                return res.redirect("/login?Tu_sesión_ha_expirado. Inicia_sesión_nuevamente")
            }

            if (!cartId) {
                console.error("Error: El cartId no está definido en la sesión del usuario.");
                return res.status(400).send("El carrito del usuario no está definido.");
            }
            if (!product) {
                res.status(404).send("El producto no existe");
                return;
            }


            res.render("product", {
                cartId: cartId,
                _id: product._id,
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
                thumbnails
            } = req.body;

            // Verifica si el usuario es 'admin' o 'premium'
            /* if (req.user.role !== 'admin' && req.user.role !== 'premium') {
                return res.status(403).send("Solo los administradores o usuarios premium pueden crear productos.");
            } */

            // Verifica si todos los campos obligatorios están presentes
            if (!title || !description || !code || !price || !stock || !category) {
                return res.status(400).send("Falta completar campos obligatorios");
            }

            // Asigna el owner basado en el rol del usuario
            const ownerId = req.session.user.id;

            const newProduct = {
                title,
                description,
                code,
                price,
                stock,
                category,
                thumbnails: thumbnails || [],
                owner: ownerId
            };

            await productRepository.createProduct(newProduct);

            // Redirige al usuario al formulario de creación de productos
            res.redirect("/api/products?Producto_creado_con_exito");

        } catch (error) {
            console.error("Error al crear un nuevo producto:", error);
            res.status(500).send("Error interno del servidor");
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
            const user = req.session.user

            if (!product) {
                res.status(404).send("El producto no existe");
                return;
            }

            // Verificar si el usuario es admin o propietario del producto (PREMIUM)
            if (user.role === 'admin' || product.owner === user.id) {
                const deletedProduct = await productRepository.deleteProduct(pid);

                if (deletedProduct) {
                    res.status(200).json({ message: "Producto eliminado correctamente", deletedProduct });
                } else {
                    res.status(404).send("El producto no pudo ser eliminado");
                }
                // Si el usuario propietario del producto es premium, enviar correo electrónico
                if (user.role === 'premium') {
                    const emailContent = `Estimado usuario premium,\n\nSu producto "${product.title}" ha sido eliminado por un administrador.\n\nAtentamente,\nEl equipo de Sucurex`;

                    await nodemailerService.sendMail(
                        user.email, // Correo del usuario premium
                        'Producto Eliminado',
                        'Su producto ha sido eliminado por un administrador.',
                        emailContent
                    );
                }
            } else {
                res.status(403).send("Acción no autorizada");
            }

        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            res.status(500).send("Error interno del servidor");

        }
    },

    renderManageProductView: async (req, res) => {
        try {
            /* const ownerId = req.session.user.id;
            const products = await productRepository.getProductsByOwner(ownerId); */
            const user = req.user;
            if (!user) {
                return res.redirect('/login'); // Redirect to login if not logged in
            }
            const userId = await Users.findOne({ email: user.email })._id;
            const products = await productRepository.getProductsByOwner(userId)
            res.render('manageProducts', {
                products,
                user,
                style: 'style.css'
            });
        } catch (error) {
            console.error('Error al renderizar la vista de gestión de productos:', error);
            res.status(500).json({ error: 'Error al renderizar la vista de gestión de productos' });
        }
    }

};

export default productsController;

