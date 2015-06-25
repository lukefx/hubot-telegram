# {Robot, Adapter, TextMessage, EnterMessage, LeaveMessage, TopicMessage} = require 'hubot'
{Robot, Adapter, TextMessage, User} = require 'hubot'
request = require 'request'

class Telegram extends Adapter

  constructor: ->
    super
    @robot.logger.info "Telegram Adapter"

    @token = process.env['TELEGRAM_TOKEN']
    @api_url = "https://api.telegram.org/bot#{@token}"
    
    @webHook = null
    @lastMessage = 1
    
  send: (envelope, strings...) ->
    self = @
    @robot.logger.info "Send"
    
    console.log envelope
    console.log strings
    
    reply = 
      chat_id: envelope.room
      text: strings.join()
    
    console.log reply
    
    request.post { url: "#{@api_url}/sendMessage", form: reply }, (err, httpResponse, body) ->
      self.robot.logger.info body

  reply: (envelope, strings...) ->
    @robot.logger.info "Reply"

  receiveMsg: (msg) ->
    console.log "Receiving message!"
    user = @robot.brain.userForId msg.message.from.id, name: msg.message.from.username, room: msg.message.chat.id
    # user = new User msg.message.from.id, name: msg.message.from.username, room: msg.message.chat.id
    message = new TextMessage user, msg.message.text, msg.message_id
    @receive message
    @lastMessage = msg.update_id
    
  run: ->
    self = @
    @robot.logger.info "Run"
    
    unless @token
      @emit 'error', new Error `'The environment variable \`\033[31mTELEGRAM_TOKEN\033[39m\` is required.'`
    
    if @webHook
      self.robot.router.post "/telegram/receive", (req, res) ->
        for msg in req.body.result
          console.log "WebHook"
          self.receiveMsg msg
    else
      setInterval ->
        self.robot.http("#{self.api_url}/getUpdates?offset=#{self.lastMessage}").get() (err, res, body) ->
          updates = JSON.parse body
          for msg in updates.result
            self.receiveMsg msg
      , 2000

    @emit "connected"
      
exports.use = (robot) ->
  new Telegram robot
  