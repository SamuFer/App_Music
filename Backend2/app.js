import express from 'express'
import { useresRouter } from './routes/users.js' // usuarios a traves de json 
// import { songsRouter } from './routes/songs.js'
import { usersRouter } from './routes/v1/user.routes.js' // usuarios a traves de mongoDB
import { adminRouter } from './routes/v1/admin.routes.js' 
import { corsMiddleware } from './middlewares/cors.js'
// import { DEFAULTS } from './config.js'
import { connectDB, SERVER_CONFIG } from './config/index.js'

const PORT = SERVER_CONFIG.PORT;
const app = express()

app.use(corsMiddleware())
app.use(express.json())

app.get('/', (req, res) => {    
    return res.send('<h1>Hello World!</h1>');   
})

app.get('/health', (req, res) => {    
    return res.json({ 
        status: 'ok',
        uptime: process.uptime(), 
    });   
})

app.use('/api/users', useresRouter)

// app.use('/api/songs', songsRouter) 

// Las rutas del usuario
app.use('/api/v1/users', usersRouter);

// Las rutas de admin
app.use('/api/v1/admin/users', adminRouter);

// Conexion a la base de datos
connectDB();

// Levantamos el servidor SOLO después de conectar a la base de datos
if (SERVER_CONFIG.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}`)
  })
}

// Función para arrancar todo
// const startServer = async () => {
//   try {
//     // 1. Conectamos a la DB primero
//     await connectDB();

//     // 2. Una vez conectados, levantamos el servidor
//     if (SERVER_CONFIG.NODE_ENV !== 'production') {
//       app.listen(PORT, () => {
//         console.log(`🚀 Servidor levantado en http://localhost:${PORT}`)
//       })
//     }
//   } catch (error) {
//     console.error('💥 No se pudo arrancar el proyecto:', error.message)
//   }
// }

// startServer();

export default app