const BASE_URL = import.meta.env.VITE_API_URL

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options, // <--- Aquí copias lo que viene de users.js (method, body)
    headers: {
      'Content-Type': 'application/json', // <--- ESTO ES EL HEADER
      ...options.headers, // <--- Aquí permites añadir más headers si fuera necesario
    },
  });

  if (!response.ok) {
    // Si el backend envía un mensaje de error, lo lanzamos
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en la petición al servidor');
  }

  // Si no hay contenido (como en un DELETE), devolvemos null
  if (response.status === 204) return null;
  
  return response.json();
}