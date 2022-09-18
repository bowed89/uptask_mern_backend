// se usa import ... en vez de const express = require("express")
// habilitando en package.json   "type": "module"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";


const app = express()
app.use(express.json())

dotenv.config()

conectarDB()

// configurar CORS 
const whiteList = [process.env.FRONTEND_URL]
const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.includes(origin)) {
            // Puede consultar la API
            callback(null, true)
        } else {
            // No esta permitido su REQUEST
            callback(new Error("Error de CORS"))
        }
    },
}

app.use(cors(corsOptions));

// Routing: se usa "use" para soportar GET, POST, PUT, PATCH, DELETE
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)


const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`Servidor Conectado en Puerto ${PORT}`);
})

// Socket.io
import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})

io.on('connection', (socket) => {
    //console.log('Conectado a SocketIO ...');

    //Definir los eventos de Socket.io
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto)
    })

    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea);
    })

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('actualizar tarea', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit('nuevo estado', tarea)
    })

})