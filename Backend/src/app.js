import express from 'express'
import { useresRouter } from './routes/users.js' // usuarios a traves de json 
// import { songsRouter } from './routes/songs.js'
import { clientUserRoutes } from './routes/v1/client/user.routes.js' // usuarios a traves de mongoDB
import { clientThemeRoutes } from './routes/v1/client/theme.routes.js'

import { adminUserRoutes } from './routes/v1/admin/user.routes.js' 
import { adminThemeRoutes } from './routes/v1/admin/theme.routes.js'
import { adminSongRoutes } from './routes/v1/admin/song.routes.js'
import { adminVoteRoutes } from './routes/v1/admin/vote.routes.js'
import { adminSpotifyRoutes } from './routes/v1/admin/spotify.routes.js'
import { AuthRoutes } from './routes/v1/auth.routes.js'

import { corsMiddleware } from './middlewares/cors.js'
// import { DEFAULTS } from './config.js'
import { connectDB, SERVER_CONFIG } from './config/index.js'
import { initThemeCron } from './cron/theme.cron.js'

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
app.use('/api/v1/users', clientUserRoutes)
app.use('/api/v1/themes', clientThemeRoutes)

// Las rutas de admin
app.use('/api/v1/admin/users', adminUserRoutes)
app.use('/api/v1/admin/themes', adminThemeRoutes)
app.use('/api/v1/admin/songs', adminSongRoutes)
app.use('/api/v1/admin/votes', adminVoteRoutes)
app.use('/api/v1/admin/spotify', adminSpotifyRoutes)
app.use('/api/v1/admin/auth', AuthRoutes)

// Conexion a la base de datos
connectDB();

// Levantamos el servidor SOLO después de conectar a la base de datos
if (SERVER_CONFIG.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`☕ Servidor corriendo en http://localhost:${PORT}`)
    // Iniciamos el cron para cerrar automáticamente las temáticas activas que ya caducaron
    initThemeCron();
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