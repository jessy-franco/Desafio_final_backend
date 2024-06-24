
document.addEventListener('DOMContentLoaded', () => {
    const removeButtons = document.querySelectorAll('.remove-btn');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const productId = event.target.dataset.productId;
            
            try {
                const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar producto del carrito');
                }

                // Actualizar la vista del carrito después de eliminar el producto
                const cartContainer = document.querySelector('.cart-container');
                cartContainer.innerHTML = '<p>Eliminando producto...</p>'; // Puedes mostrar un mensaje mientras se actualiza

                // Recargar la vista del carrito después de eliminar
                window.location.reload(); // Esto recarga la página, puedes usar AJAX para actualizar solo la parte necesaria si prefieres

            } catch (error) {
                console.error('Error al eliminar producto del carrito:', error);
                alert('Error al eliminar producto del carrito. Intenta nuevamente.');
            }
        });
    });
});
