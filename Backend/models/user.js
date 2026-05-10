import users from '../users.json' with { type: 'json' }; 

export class UserModel {
    static async getAll({name, limit = DEFAULTS.LIMIT_PAGINATION, offset = DEFAULTS.LIMIT_OFFSET}) { 
        
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

        return paginatedUsers
    }

    static async getById(id) {
        
        const idNumber = Number(id) 

        const user = users.find(user => user.id === idNumber || user.id === id) 

        return user
    }

    static async create({name, email, username, password}) {
        const newUser = {
            id: crypto.randomUUID(),
            name,
            email,
            username,
            password,
            createdAt: new Date().toISOString() 
        }  
        
        users.push(newUser)

        return newUser
    }

}