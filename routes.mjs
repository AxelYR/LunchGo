// routes.mjs

import express from 'express'
import fs from 'fs'

function escucha(app){
    const router = express.Router()
    app.use('/',router)

    // Helper para leer el archivo de datos (para las tarjetas de productos)
    const readDataFile = () => {
        return new Promise((resolve, reject) => {
            fs.readFile('datos.txt', 'utf8', (err, data) => {
                if (err) {
                    // Si el archivo no existe o hay un error, se asume un array vacío o se rechaza
                    if (err.code === 'ENOENT') { // ENOENT significa "Error NO ENTry" (archivo no encontrado)
                        console.warn('El archivo datos.txt no existe. Se inicializará como un array vacío.');
                        return resolve([]);
                    }
                    return reject(err);
                }
                try {
                    const datos = JSON.parse(data);
                    resolve(datos);
                } catch (error) {
                    reject(new Error('Error en el formato del archivo JSON de datos'));
                }
            });
        });
    };

    // Helper para escribir en el archivo de datos (para las tarjetas de productos)
    const writeDataFile = (data) => {
        return new Promise((resolve, reject) => {
            fs.writeFile('datos.txt', JSON.stringify(data, null, 2), (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };

    // --- Rutas existentes para los datos de productos (datos.txt) ---

    router.get('/data', async function(req, res, next){
        console.log('recibio peticion get en /data')
        console.log('parametros: ',req.params)
        console.log('query',req.query)
        try {
            const datos = await readDataFile();
            res.status(200).json(datos);
        } catch (error) {
            console.error('Error al leer o parsear el archivo datos.txt:', error.message);
            res.status(500).json({ error: error.message || 'Error al leer el archivo de datos' });
        }
    })

    router.post('/data', async function(req, res, next){
        console.log('recibio peticion post en /data')
        console.log('parametros: ',req.params)
        console.log('body: ',req.body)
        console.log('query',req.query)
        try {
            let datos = await readDataFile();
            const newItem = {
                id: Date.now().toString(), // Genera un ID único simple basado en la marca de tiempo
                ...req.body
            };
            datos.push(newItem);
            await writeDataFile(datos);
            res.status(201).json({ // 201 Created para POST exitoso
                'Peticion post ':'Satisfactoria',
                'insertado': newItem
            });
        } catch (error) {
            console.error('Error al procesar POST en /data:', error.message);
            res.status(500).json({ error: error.message || 'Error al procesar la solicitud POST' });
        }
    })

    router.put('/data/:id', async function(req, res, next){
        const itemId = req.params.id;
        console.log(`recibio peticion put en /data/${itemId}`);
        console.log('body: ', req.body);

        try {
            let datos = await readDataFile();
            const index = datos.findIndex(item => item.id === itemId);

            if (index === -1) {
                return res.status(404).json({ error: 'Elemento no encontrado' });
            }

            datos[index] = { ...datos[index], ...req.body, id: itemId };
            await writeDataFile(datos);
            res.status(200).json({
                'Peticion put ': 'Satisfactoria',
                'actualizado': datos[index]
            });
        } catch (error) {
            console.error('Error al procesar PUT en /data:', error.message);
            res.status(500).json({ error: error.message || 'Error al procesar la solicitud PUT' });
        }
    });

    router.delete('/data/:id', async function(req, res, next){
        const itemId = req.params.id;
        console.log(`recibio peticion delete en /data/${itemId}`);

        try {
            let datos = await readDataFile();
            const initialLength = datos.length;
            datos = datos.filter(item => item.id !== itemId);

            if (datos.length === initialLength) {
                return res.status(404).json({ error: 'Elemento no encontrado para eliminar' });
            }

            await writeDataFile(datos);
            res.status(200).json({
                'Peticion delete ': 'Satisfactoria',
                'id_eliminado': itemId
            });
        } catch (error) {
            console.error('Error al procesar DELETE en /data:', error.message);
            res.status(500).json({ error: error.message || 'Error al procesar la solicitud DELETE' });
        }
    });

    //funciones y rutas para el carrito (carrito.txt)

    // Helper para leer el archivo del carrito
    const readCartFile = () => {
        return new Promise((resolve, reject) => {
            fs.readFile('carrito.txt', 'utf8', (err, data) => {
                if (err) {
                    // Si el archivo no existe, devuelve un array vacío (carrito vacío)
                    if (err.code === 'ENOENT') {
                        console.warn('El archivo carrito.txt no existe. Se inicializará como un array vacío.');
                        return resolve([]);
                    }
                    return reject(err);
                }
                try {
                    const cart = JSON.parse(data);
                    resolve(cart);
                } catch (error) {
                    reject(new Error('Error en el formato del archivo JSON del carrito'));
                }
            });
        });
    };

    // Helper para escribir en el archivo del carrito
    const writeCartFile = (cart) => {
        return new Promise((resolve, reject) => {
            fs.writeFile('carrito.txt', JSON.stringify(cart, null, 2), (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };

    // Ruta GET /cart para obtener el contenido actual del carrito
    router.get('/cart', async function(req, res, next){
        console.log('recibio peticion get en /cart');
        try {
            const cart = await readCartFile();
            res.status(200).json(cart);
        } catch (error) {
            console.error('Error al leer el archivo del carrito:', error.message);
            res.status(500).json({ error: error.message || 'Error al leer el carrito' });
        }
    });

    // Ruta POST /cart para añadir o actualizar un producto en el carrito
    router.post('/cart', async function(req, res, next){
        console.log('recibio peticion post en /cart');
        console.log('body: ', req.body); // Espera un objeto de producto (id, nombre, precio, ruta_imagen)

        const productToAdd = req.body;
        // Validación básica: asegura que el producto tenga un ID
        if (!productToAdd || !productToAdd.id) {
            return res.status(400).json({ error: 'Datos de producto inválidos. Se requiere un ID.' });
        }

        try {
            let cart = await readCartFile(); // Lee el carrito actual
            const existingProductIndex = cart.findIndex(item => item.id === productToAdd.id);

            if (existingProductIndex > -1) {
                // Si el producto ya está en el carrito, incrementa la cantidad
                cart[existingProductIndex].cantidad = (cart[existingProductIndex].cantidad || 1) + 1;
            } else {
                // Si no está, añade el producto con cantidad 1
                cart.push({ ...productToAdd, cantidad: 1 });
            }

            await writeCartFile(cart); // Guarda el carrito actualizado
            res.status(200).json({
                'Peticion post carrito': 'Satisfactoria',
                'carrito_actualizado': cart
            });
        } catch (error) {
            console.error('Error al procesar POST para el carrito:', error.message);
            res.status(500).json({ error: error.message || 'Error al procesar la solicitud del carrito' });
        }
    });

    //Ruta DELETE /cart/:id para eliminar un producto del carrito
    router.delete('/cart/:id', async function(req, res, next){
        const itemId = req.params.id;
        console.log(`recibio peticion delete en /cart/${itemId}`);

        try {
            let cart = await readCartFile();
            const initialLength = cart.length;
            cart = cart.filter(item => item.id !== itemId);

            if (cart.length === initialLength) {
                return res.status(404).json({ error: 'Producto no encontrado en el carrito para eliminar' });
            }

            await writeCartFile(cart);
            res.status(200).json({
                'Peticion delete carrito': 'Satisfactoria',
                'id_eliminado_del_carrito': itemId
            });
        } catch (error) {
            console.error('Error al procesar DELETE para el carrito:', error.message);
            res.status(500).json({ error: error.message || 'Error al procesar la solicitud DELETE del carrito' });
        }
    });
}

export default escucha