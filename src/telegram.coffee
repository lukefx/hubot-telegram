{Robot, Adapter, TextMessage, EnterMessage, LeaveMessage, TopicMessage} = require 'hubot'

class Telegram extends Adapter

   constructor: (robot) ->
    @robot = robot
    @token = process.env['TELEGRAM_TOKEN'] || ''
    @robot.logger.info "Constructor"
    @api_url = "https://api.telegram.org/bot#{token}/"

  send: (envelope, strings...) ->
    @robot.logger.info "Send"
    
    reply = 
      chat_id: envelope.room
      text: envelope.text
      
    @robot.http("#{@api_url}/sendMessage").post(reply) (err, res, body) =>
      @robot.logger.info res

  reply: (envelope, strings...) ->
    @robot.logger.info "Reply"

  run: ->
    self = @
    @robot.logger.info "Run"
    @emit "connected"
    
    self.robot.router.post "/telegram/receive", (req, res) ->
      for msg in req.body.result
        self.receive new TextMessage msg.message.from, msg.message.text, msg.message.chat.id


exports.use = (robot) ->
  new Telegram robot
  