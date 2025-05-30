document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const paymentForm = document.querySelector('form'); // Selecciona el formulario de pago
    const CART_API_URL = 'http://localhost:9090/cart';   // URL de tu API para el carrito
    const ORDER_API_URL = 'http://localhost:9090/order'; // URL para enviar la orden

    let currentCartItems = []; // Almacenar los items del carrito para usarlos al confirmar el pedido

    // Función para obtener y mostrar el contenido del carrito
    async function fetchAndDisplayCart() {
        try {
            const response = await fetch(CART_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cart = await response.json();
            currentCartItems = cart; // Guardar el carrito actual
            renderCartItems(cart);
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            cartItemsContainer.innerHTML = '<p class="text-red-500">Error al cargar el carrito. Por favor, intente de nuevo más tarde.</p>';
            cartTotalElement.textContent = '$0.00';
        }
    }

    // funcion para renderizar los elementos del carrito en la página
    function renderCartItems(cart) {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-600">Tu carrito está vacío.</p>';
            // deshabilitar el botón de pago si el carrito esta vacio
            document.querySelector('button[type="submit"]').disabled = true;
            document.querySelector('button[type="submit"]').classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            // habilitar el boton de pago
            document.querySelector('button[type="submit"]').disabled = false;
            document.querySelector('button[type="submit"]').classList.remove('opacity-50', 'cursor-not-allowed');

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
                            <p class="text-gray-600">Precio unitario: $${item.precio.toFixed(2)}</p>
                        </div>
                    </div>
                    <span class="text-lg font-bold text-gray-800">$${itemPrice.toFixed(2)}</span>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }

    // envio del formulario de pago
    paymentForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // evitar el envio predeterminado del formulario

        if (currentCartItems.length === 0) {
            alert('Tu carrito está vacío. Por favor, añade productos antes de confirmar el pedido.');
            return;
        }
        // 1. recopilar la información del cliente del formulario
        const customerInfo = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value
        };

        // 2. recopilar los items del carrito (en currentCartItems)
        // 3. recopilar el total (cartTotalElement)
        const total = parseFloat(cartTotalElement.textContent.replace('$', '')); // Convertir a número

        const orderData = {
            customerInfo,
            cartItems: currentCartItems,
            total
        };

        try {
            // enviar la orden al backend
            const response = await fetch(ORDER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Error desconocido'}`);
            }

            const result = await response.json();
            console.log('Respuesta del servidor al confirmar pedido:', result);
            alert('¡Pedido confirmado con éxito! Se te enviaran instrucciones al correo para proceder con el pago. Tu carrito ha sido vaciado.');

        } catch (error) {
            console.error('Error al confirmar el pedido:', error);
            alert(`Error al confirmar el pedido: ${error.message}. Por favor, intente de nuevo.`);
        }
    });


    // iniciar la carga del carrito cuando la página esté lista
    fetchAndDisplayCart();
});