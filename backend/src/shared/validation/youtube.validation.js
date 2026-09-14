const Joi = require("joi");
    
const youtubeLinkValidation = Joi.string()
    .trim()
    .uri({
      scheme: ["http", "https"],
    })
    .custom((value, helpers) => {
      try {
        const url = new URL(value); 
        const hostname = url.hostname.toLowerCase();    
        const isYoutube =
          hostname === "youtube.com" ||
          hostname === "www.youtube.com" ||
          hostname === "m.youtube.com" ||
          hostname === "youtu.be";  
        if (!isYoutube) {
          return helpers.error("string.youtube");
        }   
        return value;
      } catch {
        return helpers.error("string.uri");
      }
    })
    .messages({
      "string.empty": "YOUTUBE_LINK_REQUIRED",
      "string.uri": "YOUTUBE_LINK_INVALID",
      "string.youtube": "YOUTUBE_LINK_INVALID",
    });

module.exports = youtubeLinkValidation