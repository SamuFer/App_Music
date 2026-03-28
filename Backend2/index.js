import express from 'express';
import cors from 'cors';
import users from './users.json' with { type: 'json' };
import { DEFAULTS } from './config.js';

const PORT = process.env.PORT || DEFAULTS.PORT;
const app = express();

const ACCEPTED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:4321',
    'http://localhost:5173'
    ] // lista de dominios permitidos para hacer solicitudes al backend

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || ACCEPTED_ORIGINS.includes(origin)) { // !origin es para permitir solicitudes desde herramientas como Postman, que no envian el header Origin, ACCEPTED_ORIGINS.includes(origin) es para permitir solicitudes desde los dominios especificados en la lista
                return callback(null, true)
            } 

            return callback(new Error('Origen no permitido'))
        }
    })
) // cors es un middleware que permite configurar el CORS (Cross-Origin Resource Sharing) para controlar qué dominios pueden hacer solicitudes a nuestro backend

app.use(express.json()) // middleware para parsear el cuerpo de las solicitudes como JSON

app.use((req, res, next) => {
    const timeString = new Date().toLocaleTimeString();
    console.log(`[${timeString}] ${req.method} ${req.url}`);
    next();
})


app.get('/', (req, res) => {    
    return res.send('<h1>Hello World!</h1>');   
})

app.get('/health', (req, res) => {    
    return res.json({ 
        status: 'ok',
        uptime: process.uptime(), 
    });   
})

// el GET es IDEMPOTENTE, es decir, puedes hacer la misma solicitud varias veces y obtener el mismo resultado. 
app.get('/users', (req, res) => {
    const {name, limit = DEFAULTS.LIMIT_PAGINATION, offset = DEFAULTS.LIMIT_OFFSET} = req.query
    console.log({name, limit, offset}) // req.query es un objeto que contiene los parametros de consulta, por ejemplo /...?name=John&age=30
    
    let filteredUsers = users
    
    if (name) {
        const searchTerm = name.toLowerCase()
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm)
        )
    }

    const limitNumber = Number(limit)
    const offsetNumber = Number(offset)

    const paginatedUsers = filteredUsers.slice(offsetNumber, offsetNumber + limitNumber)

    return res.json (paginatedUsers)
})

app.get('/users/:id', (req, res) => { // parametro dinamico, se accede a traves de req.params
    const { id } = req.params // req.params es un objeto que contiene los parametros dinamicos, por ejemplo /users/123 => req.params = { id: '123' }
    
    const idNumber = Number(id) // convertimos el id a numero, si no es un numero, idNumber sera NaN

    const user = users.find(user => user.id === idNumber || user.id === id) // buscamos el usuario por id, si el id es un numero, lo comparamos con el id del usuario, si no es un numero, lo comparamos con el id del usuario como string

    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }

    return res.json(user)
})

// el POST no es idempotente, es decir, si haces la misma solicitud varias veces, puedes obtener resultados diferentes (por ejemplo, crear varios usuarios con el mismo nombre)
app.post('/users', (req, res) => {
    const {name, email, username, password } = req.body // req.body es un objeto que contiene el cuerpo de la solicitud y gracias a express.json() podemos parsearlo como JSON

    const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        username,
        password,
        createdAt: new Date().toISOString() // createdAt es la fecha de creacion del usuario, en formato ISO string, por ejemplo: 2023-06-01T12:00:00.000Z
    }

    users.push(newUser)

    return res.status(201).json(newUser)
})


app.listen(PORT, () => {
    console.log(`servidor levantado en http://localhost:${PORT}`);
})