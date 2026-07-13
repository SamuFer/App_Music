import mongoose from 'mongoose'

export const themeValidator = (req, res, next) => {
    const {id} = req.params

    // 1. SIEMPRE que la URL contenga un ":id", validamos que sea un ObjectId real de Mongo
    // Esto protege tus rutas GET por ID, PUT (editar) o DELETE de que Mongoose explote con un CastError
    if (id && !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ 
            error: "// Error: El ID de la tematica no tiene un formato válido en MongoDB" 
        })
    }

    // 2. Solo si el Admin está intentando CREAR un tema (POST) o EDITAR uno (PUT), validamos el cuerpo
    if (req.method === 'POST' || req.method === 'PUT') {
        const {title, day, votingDeadline} = req.body || {}

        // Validamos campos obligatorios esenciales para el juego
        if (!title || day === undefined || !votingDeadline) {
            return res.status(400).json({ 
                error: "// Error: Faltan datos obligatorios para crear la temática (title, day o votingDeadline)." 
            })
        }

        // Validación extra de negocio: El día de la temática no puede ser negativo
        if (Number(day) < 1) {
            return res.status(400).json({ 
                error: "// Error: El número de [day] de la temática debe ser mayor o igual a 1." 
            });
        }

    }
    // Si es un PATCH, o viene un body vacío, nos aseguramos de que no rompa las validaciones inferiores
    if (req.method === 'PATCH') {
        return next(); // Los PATCH de emergencia no necesitan validar el cuerpo
    }

    next()
}