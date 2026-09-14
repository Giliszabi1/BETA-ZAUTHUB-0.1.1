const MusicRepository = require('./music.repository');

class MusicsService {
    
    async getMusics() {
        
        const musics = await MusicRepository.getMusics()
        if(musics.success){
            console.log(musics)
            return musics.answer
        }
    }
}

module.exports = MusicsService;