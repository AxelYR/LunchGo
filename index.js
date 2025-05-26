import express from 'express'
import bodyparser from 'body-parser'
import cors from 'cors'
import escucha from './routes.mjs' 

const app = express()
app.use(bodyparser.json())
app.use(cors()) 

escucha(app) //registra rutas (GET, POST, PUT, DELETE /data)

app.listen('9090', function(){
    console.log('escuchando en el puerto 9090')
})