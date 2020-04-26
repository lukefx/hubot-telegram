/**
 * Description: This script uses custom Telegram functionality to deliver messages, Photos, ...
 */

const fs = require('fs')

module.exports = function (robot) {
  /*
   * From now on, the response object exposes some methods to interact directly with Telegram.
   * For example:
   * sendMessage, sendPhoto, sendAudio, ...
   * Check the TelegramResponse interface
   */

  /**
   * This is a normal message
   */
  robot.hear(/test/, res => {
    res.send(msg.envelope.room, 'Ciao!')
  })

  /**
   * ...or you can use the enhanced sendMessage where you can specify
   * SendMessageOptions:
   *  - parse_mode
   *  - disable_web_page_preview
   */
  robot.hear(/test/, res => {
    res.sendMessage(res.envelope.room, 'Ciao!')
  })

  /**
   * For any special needs you can access the telegram instance on Robot.
   */
  robot.respond(/image me (.*)/, async res => {
    const image = await randomImage(res.match[1]) // image can be a file loaded with fs or a url
    robot.telegram.sendPhoto(res.envelope.room, image, {
      caption: 'Ok?!'
    })
  })

  /**
   * sendPhoto has the same signature of the method on the lib:
   * https://github.com/yagop/node-telegram-bot-api/blob/release/doc/api.md#telegrambotsendphotochatid-photo-options-fileoptions--promise
   */
  robot.respond(/totoro/, res => {
    const image = 'https://bit.ly/2VlEgCs'
    res.sendPhoto(res.envelope.room, image, {
      caption: 'Totoro!'
    })
  })

  /*
   * For compatibility we will continue to support the old way of calling custom telegram methods:
   */
  robot.hear(/send photo/i, function (res) {
    robot.emit(
      'telegram:invoke',
      'sendPhoto',
      {
        chat_id: res.message.room,
        photo: fs.createReadStream(__dirname + '/image.png')
      },
      function (error, response) {
        console.log(error)
        console.log(response)
      }
    )
  })
}
