// src/types/song.ts
export interface Song {
  id: string
  day: number
  title: string
  artist: string
  spotifyTrackId: string   // ← lo que necesita el iframe/SDK
  theme: string
  submittedBy: string
  votingDeadline: Date
  groupAverage?: number
}

export interface UserVote {
  songId: string
  score: number
  userId: string
}
// ```

// Con `spotifyTrackId` definido, el iframe queda así cuando llegue el dato:
// ```
// https://open.spotify.com/embed/track/${song.spotifyTrackId}