const Joi = require("joi");

const videosType = require('../../shared/validation/video_category.validation');
class VideosSchemas {
    
    selectVideoSchema = Joi.object({
        videoTypes: videosType
    })
}
module.exports = new VideosSchemas();