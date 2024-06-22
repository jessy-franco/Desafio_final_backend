/* 
document.getElementById('addToCartForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita el envío estándar del formulario

   
    const form = event.target;
    const cartId = form.action.split('/')[3];
    const productId = form.action.split('/')[5];
    const quantity = form.querySelector('input[name="quantity"]').value; 

    console.log("cartID:",cartId)
    console.log("productID:",productId)
    if (cartId && productId) {
        try {
            const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: quantity })
            });

            if (response.ok) {
                swal("¡Producto agregado al carrito exitosamente!", "", "success");
                console.log("Producto agregado al carrito");
            } else {
                swal("Error al agregar el producto al carrito", "", "error");
                console.log("Error al agregar el producto al carrito");
            }
        } catch (error) {
            console.error("Error al agregar el producto al carrito:", error);
            swal("Error al agregar el producto al carrito", "", "error");
            console.log("Error al agregar el producto al carrito");
        }
    } else {
        console.error("No se encontraron los IDs del carrito o del producto.");
    }
}); */

document.getElementById("add-to-cart-btn").addEventListener("submit", async (event) => {
    event.preventDefault();
    const cartId = req.session.user.cartId;
    const _id = document.getElementById("add-to-cart-btn").dataset.productId;
    console.log("cartID:",cartId)
    console.log("productID:",productId)
    if (productId) {
        try {
            const response = await fetch(`/api/cart/${cartId}/products/${_id}`, {
                method: "POST",
            });

            if (response.ok) {
                swal("¡Producto agregado al carrito exitosamente!", "", "success");
                console.log("agregado")
            } else {
                swal("Error al agregar el producto al carrito", "", "error");
                console.log("error")
            }
        } catch (error) {
            console.error("Error al agregar el producto al carrito:", error);
            swal("Error al agregar el producto al carrito", "", "error");
            console.log("error")
        }
    } else {
        console.error("No se encontró el ID del producto.");
        console.log(productId)
    }
});
