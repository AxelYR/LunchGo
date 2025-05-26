document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const CART_API_URL = 'http://localhost:9090/cart'; 

    // Función para obtener y mostrar el contenido del carrito
    async function fetchAndDisplayCart() {
        try {
            const response = await fetch(CART_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cart = await response.json();
            renderCartItems(cart);
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            cartItemsContainer.innerHTML = '<p class="text-red-500">Error al cargar el carrito. Por favor, intente de nuevo más tarde.</p>';
            cartTotalElement.textContent = '$0.00';
        }
    }

    // función para poner los elementos del carrito en la página
    function renderCartItems(cart) {
        cartItemsContainer.innerHTML = ''; // Limpia el contenedor
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-600">Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemPrice = item.precio * item.cantidad;
                total += itemPrice;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'flex items-center justify-between border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0';
                cartItemDiv.innerHTML = `
                    <div class="flex items-center">
                        <img src="${item.ruta_imagen}" alt="${item.nombre}" class="w-16 h-16 object-cover rounded-md mr-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800">${item.nombre}</h3>
                            <p class="text-gray-600">Cantidad: ${item.cantidad}</p>
                        </div>
                    </div>
                    <span class="text-lg font-bold text-gray-800">$${itemPrice.toFixed(2)}</span>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }
    fetchAndDisplayCart();
});