import express from 'express'
import { usersRouter } from './routes/users.js'
import { songsRouter } from './routes/songs.js'
import { corsMiddleware } from './middlewares/cors.js'
import { DEFAULTS } from './config.js'

const PORT = process.env.PORT ?? DEFAULTS.PORT
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

app.use('/users', usersRouter)

app.use('/songs', songsRouter) 


if (!process.env.NODE_ENV) {
  app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}`)
  })
}

export default app