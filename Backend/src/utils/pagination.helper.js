/**
 * Helper para estandarizar las respuestas con paginación
 */
export const formatPaginatedResponse = ({ data, totalDocuments, limit, offset }) => {
  return {
    data,
    pagination: {
      totalDocuments: totalDocuments,
      counts: data.length,
      limit: Number(limit),
      offset: Number(offset) 
    }
  }
}