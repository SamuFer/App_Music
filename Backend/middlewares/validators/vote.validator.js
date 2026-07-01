import mongoose from 'mongoose'

export const voteValidatorRequest = (req, res, next) => {
    const { themeId, songId } = req.params
    const { userId, score } = req.body || {}

    // 1. Validar el ID de la temática (URL)
    if (themeId && !mongoose.isValidObjectId(themeId)) {
        return res.status(400).json({ error: "// Error: El ID de la temática no tiene un formato válido de MongoDB." })
    }

    // 2. Validar el ID de la canción (URL)
    if (songId && !mongoose.isValidObjectId(songId)) {
        return res.status(400).json({ error: "// Error: El ID de la canción no tiene un formato válido de MongoDB." })
    }

    // 3. Si es un POST para emitir un voto, exigimos y validamos el userId en el Body
    if (req.method === "POST") {
        if (!userId || score === undefined) {
            return res.status(400).json({ error: "// Error: Faltan campos obligatorios [userId, score]." })
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ error: "// Error: El ID del usuario no es un formato válido de MongoDB." })
        }

        // Validación veloz en el middleware para el rango 1-10
        const parsedScore = Number(score);
        if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 10 || !Number.isInteger(parsedScore)) {
            return res.status(400).json({ error: "// Error: La puntuación [score] debe ser un número entero entre 1 y 10." });
        }
    }

    next() // Si todo está bien, pasamos al siguiente middleware o controlador

}