const MusicsService = require('./music.service');

class MusicsController {
    constructor() {
        this.MusicsService = new MusicsService();

        this.getMusics = this.getMusics.bind(this);


    }

    async getMusics(req, res, next) {

        const result = await this.MusicsService.getMusics()

        res.send(JSON.stringify({
            success: true,
            result: result
        }))
    }
}

module.exports = new MusicsController();