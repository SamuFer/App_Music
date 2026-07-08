export const spotifyValidator = (req, res, next) => {
  // Capturamos el término de búsqueda de la Query String (?q=...)
  const { q } = req.query;

  // 1. Validar que el parámetro 'q' exista y no venga vacío
  if (!q || q.trim() === "") {
    return res.status(400).json({ 
      error: "// Error: El parámetro de búsqueda 'q' es obligatorio y no puede estar vacío." 
    });
  }

  // 2. Validar que el término no sea exageradamente largo por seguridad
  if (q.length > 100) {
    return res.status(400).json({ 
      error: "// Error: El término de búsqueda es demasiado largo (máximo 100 caracteres)." 
    });
  }

  // Todo legal, pasamos al controlador
  next();
};