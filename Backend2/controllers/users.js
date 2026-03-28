import { UserModel } from '../models/user.js';
import { DEFAULTS } from "../config.js"

export class UserController {
    static async getAll(req, res) {
        const {name, limit = DEFAULTS.LIMIT_PAGINATION, offset = DEFAULTS.LIMIT_OFFSET} = req.query
        
        

        const users = await UserModel.getAll({name, limit, offset})
        
        const limitNumber = Number(limit)
        const offsetNumber = Number(offset)

        return res.json( {data: users, total: users.length, limit: limitNumber, offset: offsetNumber})

        
    }     

    static async getId(req, res) { 
        const { id } = req.params 
        
        const user = await UserModel.getById(id)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        return res.json(user)
    }

    static async create(req, res) {
        const {name, email, username, password } = req.body 

        const newUser = await UserModel.create({name, email, username, password})

        users.push(newUser)

        return res.status(201).json(newUser)
    }
}
