import { VoteService } from "../../services/vote.service.js"
import { AppError } from "../../utils/customError.js"

export const VoteClientController = class {

    // EMITIR UN VOTE
    static async castVote(req, res){
        try{
            const { themeId, songId } = req.params
            const { userId, score } = req.body

            //Las validaciones de estructura de IDs y campos obligatorios ya se hicieron en el Middleware
            const vote = await VoteService.createVote( themeId, songId, userId, score )

            return res.status(201).json({
                success: true,
                message: '// Voto registrado con éxito. ¡Gracias por participar!',
                data: vote
            })
        } 
        
        catch(error){
            if (error instanceof AppError){
                return res.status(error.statusCode).json({ error: `// ${error.message}`})
            } 

            return res.status(500).json({error: `// Error interno del servidor: ${error.message}`})
        }
    }

    // VISTA DEL PANEL DE VOTACIÓN DEL CLIENTE (Formato idéntico a tu JSON ejemplo del frontend-client)
    static async getVotingPanel(req, res) {
        try {
            const { themeId } = req.params;

            // El servicio calcula los promedios (groupAverage) y arma el JSON exacto de tu ejemplo
            const songsWithMedia = await VoteService.getClientSongsWithAverage(themeId)

            return res.status(200).json({
                success: true,
                data: songsWithMedia
        })

        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: `// ${error.message}` })
            }
            return res.status(500).json({ error: `// Error al cargar el panel de votación: ${error.message}` });
        }
    }
}