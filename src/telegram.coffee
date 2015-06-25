{Robot, Adapter, TextMessage, EnterMessage, LeaveMessage, TopicMessage} = require 'hubot'

class Telegram extends Adapter

  constructor: ->
    super
    @robot.logger.info "Telegram Adapter"

    @token = process.env['TELEGRAM_TOKEN'] || ''
    @api_url = "https://api.telegram.org/bot#{@token}"
    
    @webHook = null
    @lastMessage = 1
    
  send: (envelope, strings...) ->
    @robot.logger.info "Send"
    
    reply = 
      chat_id: envelope.room
      text: envelope.text
      
    @robot.http("#{@api_url}/sendMessage").post(reply) (err, res, body) =>
      @robot.logger.info res

  reply: (envelope, strings...) ->
    @robot.logger.info "Reply"

  receiveMsg: (msg) ->
    user = @robot.brain.userForId msg.message.from.id, name: msg.message.from.username, room: msg.message.chat.id
    message = new TextMessage user, msg.message.text, msg.message.message_id
    @receive message
    @lastMessage = msg.update_id
    
  run: ->
    self = @
    @robot.logger.info "Run"
    @emit "connected"
    
    if @webHook
      self.robot.router.post "/telegram/receive", (req, res) ->
        for msg in req.body.result
          self.receiveMsg msg
    else
      setTimeout ->
        self.robot.http("#{self.api_url}/getUpdates?offset=#{self.lastMessage}").get() (err, res, body) ->
          updates = JSON.parse body
          for msg in updates.result
            self.receiveMsg msg
      , 1000

exports.use = (robot) ->
  new Telegram robot
  