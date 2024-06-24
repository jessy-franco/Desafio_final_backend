API de Sucurex - Sistema de Comercio Electrónico para Vivero, Jardín y Plantas

Introducción
Esta API proporciona endpoints para manejar productos, carritos, sesiones y usuarios en Sucurex, un sistema de comercio electrónico especializado en artículos de vivero, jardín y plantas.

Link de Railway: "desafiofinalbackend-production.up.railway.app"

Autenticación

Los usuarios pueden iniciar sesión con correo y contraseña o mediante autenticación con GitHub. También es posible registrarse directamente en la página.

Endpoints

Carritos
Obtener todos los carritos



Método: GET

URL: /api/carts/:cid
Descripción: Devuelve un carrito específico según el ID proporcionado.
Función del Controller: getCartById
Agregar un nuevo carrito

Método: POST

URL: /api/carts
Descripción: Agrega un nuevo carrito.
Función del Controller: createCart
Crea un carrito para el usuario


Agregar un producto al carrito

Método: POST
URL: /api/carts/:cid/products/:pid
Descripción: Agrega un producto al carrito.
Función del Controller: addProductToCart


Eliminar un producto del carrito

Método: DELETE
URL: /api/carts/:cid/products/:pid
Descripción: Elimina un producto del carrito.
Función del Controller: removeProductFromCart

Vaciar un carrito por ID

Método: DELETE
URL: /api/carts/:cid
Descripción: Elimina todos los productos de un carrito.
Función del Controller: clearCart


Actualizar productos en el carrito

Método: PUT
URL: /api/carts/:cid
Descripción: Actualiza los productos en un carrito específico.
Función del Controller: updateCartProducts


Actualizar la cantidad de productos en el carrito

Método: PUT
URL: /api/carts/:cid/products/:pid
Descripción: Actualiza la cantidad de un producto en el carrito.
Función del Controller: updateProductQuantity


Realizar una compra

Método: PUT
URL: /api/carts/:cid/purchase
Descripción: Procesa la compra de un carrito, cambiando su estado.
Función del Controller: completePurchase


Productos
Obtener todos los productos

Método: GET
URL: /api/products
Descripción: Devuelve todos los productos disponibles.
Función del Controller: getAllProducts


Obtener un producto por ID

Método: GET
URL: /api/products/:pid
Descripción: Devuelve un producto específico según el ID proporcionado.
Función del Controller: getProductById


Agregar un nuevo producto

Método: POST
URL: /api/products/
Descripción: Agrega un nuevo producto.
Función del Controlador: createProduct


Actualizar un producto por ID

Método: PUT
URL: /api/products/:pid
Descripción: Actualiza un producto existente según el ID proporcionado.
Función del Controlador: updateProduct

Eliminar un producto por ID

Método: DELETE
URL: /api/products/:pid
Descripción: Elimina un producto específico según el ID proporcionado.
Función del Controlador: deleteProduct

Generar productos ficticios

Método: GET
URL: /mockingproducts
Descripción: Genera y devuelve una lista de productos ficticios.


Usuarios
Obtener todos los usuarios

Método: GET
URL: /api/users
Descripción: Devuelve todos los usuarios registrados.
Función del Controller: getAllUsers

Eliminar un usuario por ID

Método: DELETE
URL: /api/users/:uid
Descripción: Elimina un usuario específico según el ID proporcionado.
Función del Controller: deleteUser


Eliminar usuarios inactivos

Método: DELETE
URL: /api/users/inactive
Descripción: Elimina los usuarios que no se han conectado en más de dos días.
Función del Controller: deleteInactiveUsers

Session

Registrar un nuevo usuario

Método: POST
URL: /register
Descripción: Registra un nuevo usuario en el sistema.
Función del Controller: register

Iniciar sesión

Método: POST
URL: /login
Descripción: Inicia sesión de un usuario existente.
Función del Controller: login

Cerrar sesión

Método: GET
URL: /logout
Descripción: Cierra la sesión del usuario actual.
Función del Controller: logout

Restaurar contraseña

Método: POST
URL: /reset-password
Descripción: Permite al usuario restaurar su contraseña.
Función del Controller: renderResetPasswordForm


Método: PUT
URL: /api/users/:uid/rol
Descripción: Actualiza el rol de un usuario específico.
Función del Controller: updateUserRole

Otros Endpoints y Funcionalidades

Enviar correo electrónico de recuperación de contraseña
Método: GET
URL: /mail
Descripción: Permite al usuario restaurar su contraseña.
Función del Controller: forgotPassword

Vistas y funcionalidades adicionales relevantes:


/new: Vista de administración de los productos (creación).

/manageProducts: Renderiza /products con funciones para eliminar segun el producto sea de un usuario premium o si el usuario es admin
/login: Renderiza /login.
/register: Renderiza /register para crear un usuario.
/manageUsers: Renderiza /api/users/admin; vista administrativa de todos los usuarios donde se puede eliminar y cambiar el rol de cada uno.

Realizar Compra
URL del Endpoint: /api/carts/:cid/purchase
