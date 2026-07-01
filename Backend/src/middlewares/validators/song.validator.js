import mongoose from 'mongoose'

export const songValidator = (req, res, next) => {
  // Capturamos ambos posibles nombres de ID en la URL
  const { themeId, id } = req.params

  // 1. Validar el ID si viene como 'themeId' (ej: /themes/:themeId/songs)
  if (themeId && !mongoose.isValidObjectId(themeId)) {
    return res.status(400).json({ 
      error: "// Error: El ID de la temática no tiene un formato válido de MongoDB." 
    });
  }

  // 2. Validar el ID si viene como 'id' (ej: /songs/:id)
  if (id && !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ 
      error: "// Error: El ID de la canción no tiene un formato válido de MongoDB." 
    });
  }

  // 3. Esto SOLO se ejecuta si la petición es un POST (creación)
  if (req.method === "POST") {
    const { title, artist, spotifyTrackId } = req.body || {};
    if (!title || !artist || !spotifyTrackId) {
      return res.status(400).json({ 
        error: "// Error: Faltan datos obligatorios en el cuerpo (title, artist o spotifyTrackId)." 
      })
    }
  }

  // Todo legal, pasamos al controlador
  next()
};