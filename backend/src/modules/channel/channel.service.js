const ChannelRepository = require('./channel.repository');

class ChannelController {

    async getChannelInfo({ channel_id }) {
        const user = await ChannelRepository.getChannelInfo({channel_id})
        if(user.success){
            return {
                success: true,
                answer: user.result
            }
        }else{
            return {
                success: false,
                error: user.error
            }
        }
    }

    async getChannelVideos({channel_id}) {
        const userVideos = await ChannelRepository.getChannelVideos({channel_id})

        if(userVideos.success){
            return {
                success: true,
                answer: userVideos.result
            }
        }else{
            return {
                success: false,
                error: userVideos.error
            }
        }
    }

}
module.exports = ChannelController