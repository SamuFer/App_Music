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

    // 2. Solo si el método es POST, validamos el Body según el endpoint
    if (req.method === "POST") {
        const { email, name, password } = req.body || {}

        // 🟢 CASO A: Es un LOGIN (no exigimos 'name')
        if (req.path.includes('/login')) {
            if (!email || !password) {
                return res.status(400).json({ 
                    error: "// Error: Faltan datos obligatorios para iniciar sesión (email y password)." 
                })
            }
        } 
        // 🟢 CASO B: Es un REGISTRO / CREACIÓN (sí exigimos 'name', 'email' y 'password')
        else {
            if (!email || !name || !password) {
                return res.status(400).json({ 
                    error: "// Error: Faltan datos obligatorios para registrar al usuario (name, email y password)." 
                })
            }
        }
        
        // Validación básica de email para cualquier POST
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ 
                error: "// Error: El formato del correo electrónico proporcionado no es válido." 
            })
        }
    }

    next() // Si todo está bien, pasamos al siguiente middleware o controlador
}