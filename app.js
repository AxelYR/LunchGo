// app.js

document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cards-container');
    const PRODUCTS_API_URL = 'http://localhost:9090/data'; // URL para obtener los productos de las tarjetas
    const CART_API_URL = 'http://localhost:9090/cart';   // URL para gestionar el carrito

    //=funcion para obtener y mostrar los productos
    async function fetchAndDisplayProducts() {
        try {
            const response = await fetch(PRODUCTS_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            renderProductCards(products);
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            cardsContainer.innerHTML = '<p class="text-red-500">Error al cargar los productos. Por favor, intente de nuevo más tarde.</p>';
        }
    }

    //funcion para renderizar las tarjetas de productos 
    function renderProductCards(products) {
        cardsContainer.innerHTML = ''; //limpia el contenedor antes de añadir nuevas tarjetas

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'min-w-[250px] max-w-xs flex-shrink-0 bg-burnt-sienna rounded-lg shadow-lg';
            card.innerHTML = `
                <div class="px-4 py-2">
                    <h1 class="text-xl font-bold text-gray-800 uppercase dark:text-white">${product.nombre}</h1>
                </div>
                <img class="object-cover w-full h-[250px] mt-2"
                    src="${product.ruta_imagen}"
                    alt="${product.nombre}">
                <div class="flex items-center justify-between px-4 py-2 bg-burnt-sienna">
                    <h1 class="text-lg font-bold text-white">$${product.precio}</h1>
                    <button class="px-2 py-1 text-xs font-semibold text-gray-900 uppercase transition bg-earth-yellow hover:bg-zomp add-to-cart-btn"
                            data-product='${JSON.stringify(product)}'>
                        Añadir al carrito
                    </button>
                </div>
            `;
            cardsContainer.appendChild(card);
        });

        // Añadir event listeners a los botones de "Añadir al carrito" después de que las tarjetas se han creado
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }

    //función para añadir producto al carrito 
    async function handleAddToCart(event) {
        const productData = JSON.parse(event.target.dataset.product); //obtiene los datos del producto

        try {
            // Envía el producto al backend para que lo gestione en carrito.txt
            const response = await fetch(CART_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData) // Envía los datos del producto al servidor
            });

            if (!response.ok) {
                const errorData = await response.json(); // Intenta leer el mensaje de error del servidor
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Error desconocido'}`);
            }

            const result = await response.json();
            console.log('Respuesta del servidor al añadir al carrito:', result);
            alert(`${productData.nombre} ha sido añadido al carrito.`); // Notificación simple

        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            alert(`Error al añadir el producto al carrito: ${error.message}. Por favor, intente de nuevo.`);
        }
    }

    fetchAndDisplayProducts();
});
