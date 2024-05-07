import Product from "../daos/models/products.schema.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import ProductRepository from '../repositories/productsRepository.js';
import errorHandler from "../middlewares/errorMiddlewares.js"
import Users from "../daos/models/userSchema.js"

const productRepository = new ProductRepository();

const productsController = {
    getAllProducts: async (req, res) => {
        try {
            let { limit = 12, page = 1, sort, query, stock } = req.query;
            limit = parseInt(limit);
            page = parseInt(page);


            const filterOptions = { stock };
            const products = await productRepository.getAllProducts(filterOptions);

            const options = {
                page,
                limit,
                sort: sort ? { price: sort === 'asc' ? 1 : -1 } : null,
                lean: true
            };

            // Ejecutar la consulta utilizando el método de paginación
            const result = await Product.paginate({ category: query }, options);

            // Construir los enlaces de paginación
            const pagination = {
                currentPage: result.page,
                totalPages: result.totalPages,
                prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : '',
                nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : '',
                isValid: !(page <= 0 || page > result.totalPages)
            };

            res.render("products", {
                products: products,
                pagination,
                style: "products.css"
            });
            /* Get all products sin jwt para que el cliente pueda ver los productos independientemente  de si esta logueado o no */
            /*    try {
                   const token = req.signedCookies.jwt;
                   if (!token) {
                       res.redirect("/login");
                       return;
                   }
           
                   const decodedToken = jwt.verify(token, "secret_jwt");
                   const userId = decodedToken.id;
                   const user = await userRepository.getUserById(userId);
               res.render("products", {
                   products: products,
                   pagination,
                   user:user,
                   style: "products.css"
               });
           } catch (error) {
               console.error("Error al obtener productos:", error);
               /* res.status(500).json({ status: 500, error: "Internal Server Error" }); */
            /*  errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
         }
              */
            // Llamar a la función environment para establecer la conexión y obtener los resultados paginados
            const environment = async () => {
                await mongoose.connect("mongodb+srv://jesicafranco1518:Seifer1979@cluster0.4oanjkk.mongodb.net/eccomerce?retryWrites=true&w=majority");

                // Obtener los resultados de la página actual
                const pageSize = 12; // Tamaño de la página
                const currentPage = parseInt(req.query.page) || 1;
                const skip = (currentPage - 1) * pageSize;
                const products = await Product.find().skip(skip).limit(pageSize);

                // Contar el total de productos para calcular el número total de páginas
                const totalProducts = await Product.countDocuments();
                const totalPages = Math.ceil(totalProducts / pageSize);

                // Calcular la página anterior y siguiente
                const prevPage = currentPage > 1 ? currentPage - 1 : null;
                const nextPage = currentPage < totalPages ? currentPage + 1 : null;

                // Determinar si hay página previa y siguiente
                const hasPrevPage = currentPage > 1;
                const hasNextPage = currentPage < totalPages;

                // Construir los enlaces de paginación
                const prevLink = hasPrevPage ? `/api/products?page=${prevPage}` : null;
                const nextLink = hasNextPage ? `/api/products?page=${nextPage}` : null;

                // Construir el objeto de respuesta
                const response = {
                    status: "success",
                    payload: products,
                    totalPages: totalPages,
                    prevPage: prevPage,
                    nextPage: nextPage,
                    page: currentPage,
                    hasPrevPage: hasPrevPage,
                    hasNextPage: hasNextPage,
                    prevLink: prevLink,
                    nextLink: nextLink
                };

                // Imprimir la respuesta
                console.log(response);
            };

            // Llamar a la función environment
            environment();
        } catch (error) {
            console.error("Error al obtener todos los productos:", error);
            /* res.status(500).send("Error interno del servidor"); */
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    getProductById: async (req, res) => {
        try {
            const id = req.params.id;
            const product = await productRepository.getProductById(id);
            console.log("id recibido:", id)
            if (!product) {
                /* res.status(404).send("El producto no existe");
                return; */
                errorHandler({ code: 'ERROR_404_PRODUCT', message: error.message }, req, res);
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
            /* res.status(500).send("Error interno del servidor"); */
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
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

            } = req.body;

            let owner = req.body.owner || 'admin';

            // Verificar si el propietario es un usuario premium y almacenar solo su correo electrónico
            if (owner !== 'admin') {
                // Verificar si el usuario es premium
                const user = await Users.findOne({ email: owner });
                if (user && user.premium === true) {
                    owner = user.email;
                }
            }

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
                    owner: owner

                };

                // Agrega el nuevo producto a la base de datos
                console.log("Datos recibidos del formulario:", req.body);
                await productRepository.createProduct(newProduct);

                // Redirige al usuario al formulario de creación de productos
                res.redirect("/api/products/");
            } else {
                // Si falta algún campo obligatorio, devuelve un error 400
                /* res.status(400).send("Falta completar campos obligatorios") */
                errorHandler({ code: 'MISSING_FIELDS', message: error.message }, req, res);
            }
        } catch (error) {
            console.error("Error al crear un nuevo producto:", error);
            /* res.status(500).send("Error interno del servidor"); */
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },

    updateProduct: async (req, res) => {
        try {
            const pid = req.params._id;
            const updatedFields = req.body;

            /* Validar que el producto exista antes de actualizar */
            const product = await productRepository.getProductById(pid);
            if (!product) {

                errorHandler({ code: 'ERROR_404_PRODUCT', message: error.message }, req, res);
            }
            // Verificar si el usuario es admin o si el producto le pertenece
            if (req.user.role === 'admin' || product.owner === req.user.email) {
                const updatedProduct = await productRepository.updateProduct(pid, updatedFields);

                if (updatedProduct) {
                    res.redirect(`/api/products/${pid}`);
                } else {
                    errorHandler({ code: 'ERROR_404_PRODUCT', message: error.message }, req, res);
                }
            } else {
                errorHandler({ code: 'UNAUTHORIZED', message: "Unauthorized action" }, req, res);
            }
        } catch (error) {
            errorHandler({ code: 'INTERNAL_SERVER_ERROR', message: error.message }, req, res);
        }
    },
    deleteProduct: async (req, res) => {
        try {
            const pid = req.params._id;
            /* Validar que el producto exista antes de eliminar */
            const product = await productRepository.getProductById(pid);
            if (!product) {
                errorHandler({ code: 'ERROR_404_PRODUCT', message: error.message }, req, res);
            }
            // Verificar si el usuario es admin,  o propietario del producto(PREMIUM)
            if (req.user.role === 'admin' || product.owner === req.user.email) {
                const deletedProduct = await productRepository.deleteProduct(pid);

                if (deletedProduct) {
                    res.status(200).json({ message: "Producto eliminado correctamente", deletedProduct });
                } else {
                    errorHandler({ code: 'ERROR_404_PRODUCT', message: error.message }, req, res);
                }
            } else {
                errorHandler({ code: 'UNAUTHORIZED', message: "Unauthorized action" }, req, res);
            }
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            errorHandler({ code: 'ERROR_DELETE', message: error.message }, req, res);
        }
    },
};

export default productsController;
