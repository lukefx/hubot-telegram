{Robot, Adapter, TextMessage, User} = require 'hubot'
request = require 'request'

class Telegram extends Adapter

  constructor: ->
    super
    @robot.logger.info "Telegram Adapter loaded"

    @token = process.env['TELEGRAM_TOKEN']
    @api_url = "https://api.telegram.org/bot#{@token}"
    
    @webHook = process.env['TELEGRAM_WEBHOOK']
    @lastUpdateId = 0
    
  send: (envelope, strings...) ->
   
    reply = 
      chat_id: envelope.room
      text: strings.join()
    
    request.post { url: "#{@api_url}/sendMessage", form: reply }, (err, httpResponse, body) =>
      @robot.logger.info httpResponse.statusCode

  reply: (envelope, strings...) ->
    @robot.logger.info "Reply"

  receiveMsg: (msg) ->
    user = @robot.brain.userForId msg.message.from.id, name: msg.message.from.username, room: msg.message.chat.id
    message = new TextMessage user, msg.message.text, msg.message_id
    @receive message
    @lastUpdateId = msg.update_id

  getLastUpdateId: ->
    parseInt(@lastUpdateId) + 1
    
  run: ->
    self = @
    @robot.logger.info "Run"
    
    unless @token
      @emit 'error', new Error `'The environment variable \`\033[31mTELEGRAM_TOKEN\033[39m\` is required.'`
    
    if @webHook
      # Call `setWebHook` to dynamically set the URL
      @robot.router.post "/telegram/receive", (req, res) =>
        console.log req.body
        for msg in req.body.result
          @robot.logger.info "WebHook"
          @receiveMsg msg
    else
      setInterval ->
        url = "#{self.api_url}/getUpdates?offset=#{self.getLastUpdateId()}"
        self.robot.http(url).get() (err, res, body) ->
          self.emit 'error', new Error err if err
          updates = JSON.parse body
          for msg in updates.result
            self.receiveMsg msg
      , 2000

    @emit "connected"
      
exports.use = (robot) ->
  new Telegram robot
