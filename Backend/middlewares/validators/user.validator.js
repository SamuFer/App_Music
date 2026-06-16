import mongoose from "mongoose"

export const userValidatorRequest = (req, res, next) => {
    const {id} = req.params

    // 1. SIEMPRE que la URL contenga un ":id", validamos su estructura hexadecimal de Mongo
    // Esto protege tus endpoints GET/:id, PUT y DELETE de un CastError inmediato
    if (id && !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ 
        error: "// Error: El ID del usuario no tiene un formato válido de MongoDB." 
        })
    }

    // 2. Solo si el método es POST (creación de usuario), validamos los campos del Body
    if (req.method === "POST") {
        const { username, email, name } = req.body || {}

        // Validamos que existan los datos mínimos esenciales requeridos por el modelo
        if (!username || !email || !name) {
            return res.status(400).json({ 
                error: "// Error: Faltan datos obligatorios para registrar al usuario (username, email y name)." 
            })
        }
        
        // Validación extra básica de formato de correo en el backend
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) { // test() devuelve true si el email es válido, false si no lo es
            return res.status(400).json({ 
                error: "// Error: El formato del correo electrónico proporcionado no es válido." 
            })
        }
    }

    next() // Si todo está bien, pasamos al siguiente middleware o controlador
}