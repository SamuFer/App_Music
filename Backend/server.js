import { createServer } from 'node:http'
import {json} from 'node:stream/consumers'  
import {randomUUID} from 'node:crypto'

process.loadEnvFile(); // carga las variables desde el .env 

const port = process.env.PORT || 3000
 
function sendJson(res, statusCode, data) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
}

const users = [
  {
    id: 1,
    name: "Samuel Fer",
  },
  {
    id: 2,
    name: "Luis Salas",
  }
];

const server = createServer(async (req, res) => { // necesitamos async porque vamos a leer el cuerpo de la petición, que es una operación asíncrona
    // {method, url} = req es lo mismo que const method = req.method y const url = req.url
    const {  method, url } = req 
    console.log(`${method} ${url}`) // para ver el método y la url de cada petición que llega al servidor

    // if (method !== 'GET') { // solo permitimos el método GET, si es otro método, respondemos con un error 405
    //     return sendJson(res, 405, { error: 'Method not allowed' });
    // }

    if ( method === "GET"){
        if (url === '/users') { // si la url es /users, respondemos con una lista de usuarios en formato JSON
                return sendJson(res, 200, users);
            }

        if (url === '/health') { // endpoint de salud para comprobar que el servicio está funcionando o si esta levantado durante mucho tiempo.
            return sendJson( res, 200, { status: 'ok', uptime: process.uptime() });
        }
    }

    if (url === '/') { // si la url es la raíz, respondemos con un mensaje de bienvenida
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        return res.end('Bienvenido al server de App music 😠')
    }

    if ( method === 'POST'){
        if (url === '/users') { // si la url es /users, respondemos con una lista de usuarios en formato JSON
            const body = await json(req) // para leer el cuerpo de la petición, que se espera que sea un JSON con el nombre del usuario a crear
            
            if (!body || !body.name){
                return sendJson(res, 400, { error: 'Name is required' });
            }
            
            const newUser = { // creamos un nuevo usuario con un id aleatorio y el nombre que nos han enviado en el cuerpo de la petición
                id: randomUUID(), 
                name: body.name 
            } 
            users.push(newUser) // añadimos el nuevo usuario a la lista de usuarios

            return sendJson(res, 201, { message: 'Usuario creado' });
        }
    }

    return sendJson(res, 404, { error: 'Not found' }); // si la url no coincide con ninguna de las anteriores, respondemos con un error 404
}) 

server.listen(port, () => {
    const address = server.address() 
    console.log(`Server is listening on http://localhost:${address.port}`)
})