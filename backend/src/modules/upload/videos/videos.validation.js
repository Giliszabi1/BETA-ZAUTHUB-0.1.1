const Joi = require("joi");

const youtubeVideoURLvalidation = require('../../../shared/validation/youtube.validation');
const videosType = require('../../../shared/validation/video_category.validation');
class VideosSchemas {
    
    uploadVideoSchema = Joi.object({
        video_url: youtubeVideoURLvalidation,
        videosType: videosType
    })
}
module.exports = new VideosSchemas();