{Robot, Adapter, TextMessage, EnterMessage, LeaveMessage, TopicMessage, CatchAllMessage, User} = require 'hubot'
telegrambot = require 'telegrambot'

class Telegram extends Adapter

  constructor: ->
    super
    self = @

    @token = process.env['TELEGRAM_TOKEN']
    @webhook = process.env['TELEGRAM_WEBHOOK']
    @interval = process.env['TELEGRAM_INTERVAL'] || 2000
    @offset = 0
    @api = new telegrambot(@token)

    @robot.logger.info "Telegram Adapter Bot " + @token + " Loaded..."

    # Get the bot information
    @api.invoke 'getMe', {}, (err, result) ->
      if (err)
        self.emit 'error', err
      else
        self.bot_id = result.id
        self.bot_username = result.username
        self.bot_firstname = result.first_name
        self.robot.logger.info "Telegram Bot Identified: " + self.bot_firstname

        if self.bot_username != self.robot.name
          self.robot.logger.warning "It is advised to use the same bot name as your Telegram Bot: " + self.bot_username
          self.robot.logger.warning "Having a different bot name can result in an inconsistent experience when using @mentions"

  ###*
  # Clean up the message text to remove duplicate mentions of the
  # bot name and to strip Telegram specific characters such as the usage
  # of / when addressing a bot in privacy mode
  #
  # @param string text
  # @param int    chat_id
  #
  # @return string
  ###
  cleanMessageText: (text, chat_id) ->
# If it is a private chat, automatically prepend the bot name if it does not exist already.
    if (chat_id > 0)
# Strip out the stuff we don't need.
      text = text.replace(/^\//g, '').trim()

      text = text.replace(new RegExp('^@?' + @robot.name.toLowerCase(), 'gi'), '');
      text = text.replace(new RegExp('^@?' + @robot.alias.toLowerCase(), 'gi'), '') if @robot.alias
      text = @robot.name + ' ' + text.trim()
    else
      text = text.trim()

    return text

  ###*
  # Add extra options to the message packet before deliver. The extra options
  # will be pulled from the message envelope
  #
  # @param object message
  # @param object extra
  #
  # @return object
  ###
  applyExtraOptions: (message, extra) ->
    text = message.text
    autoMarkdown = /\*.+\*/.test(text) or /_.+_/.test(text) or /\[.+\]\(.+\)/.test(text) or /`.+`/.test(text)

    if autoMarkdown
      message.parse_mode = 'Markdown'

    if extra?
      for key, value of extra
        message[key] = value

    return message

  ###*
  # Get the last offset + 1, this will allow
  # the Telegram API to only return new relevant messages
  #
  # @return int
  ###
  getLastOffset: ->
    parseInt(@offset) + 1

  ###*
  # Create a new user in relation with a chat_id
  #
  # @param object user
  # @param object chat
  #
  # @return object
  ###
  createUser: (user, chat) ->
    opts = user
    opts.name = opts.username
    opts.room = chat.id
    opts.telegram_chat = chat

    result = @robot.brain.userForId user.id, opts
    current = result.first_name + result.last_name + result.username
    update = user.first_name + user.last_name + user.username

    # Check for any changes, if the first or lastname updated...we will
    # user the new user object instead of the one from the brain
    if current != update
      @robot.brain.data.users[user.id] = user
      @robot.logger.info "User " + user.id + " regenerated. Persisting new user object."
      return user

    return result

  ###*
  # Abstract send interaction with the Telegram API
  ###
  apiSend: (opts, cb) ->
    @self = @
    chunks = opts.text.match /[^]{1,4096}/g

    @robot.logger.debug "Message length: " + opts.text.length
    @robot.logger.debug "Message parts: " + chunks.length

    # Chunk message delivery when required
    send = (cb) =>
      unless chunks.length == 0
        current = chunks.shift()
        opts.text = current

        @api.invoke 'sendMessage', opts, (err, message) =>
# Forward the callback to the original handler
          cb.apply @, [err, message]

          send cb

    # Start the recursive chunking cycle
    send cb

  ###*
  # Send a message to a specific room via the Telegram API
  ###
  send: (envelope, strings...) ->
    self = @
    text = strings.join()
    data = @applyExtraOptions({chat_id: envelope.room, text: text}, envelope.telegram);

    @apiSend data, (err, message) =>
      if (err)
        self.emit 'error', err
      else
        self.robot.logger.info "Sending message to room: " + envelope.room

  ###*
  # The only difference between send() and reply() is that we add the "reply_to_message_id" parameter when
  # calling the API
  ###
  reply: (envelope, strings...) ->
    self = @
    text = strings.join()
    data = @applyExtraOptions({
      chat_id: envelope.room,
      text: text,
      reply_to_message_id: envelope.message.id
    }, envelope.telegram);

    @apiSend data, (err, message) =>
      if (err)
        self.emit 'error', err
      else
        self.robot.logger.info "Reply message to room/message: " + envelope.room + "/" + envelope.message.id

  ###*
  # "Private" method to handle a new update received via a webhook
  # or poll update.
  ###
  handleUpdate: (update) ->
    @robot.logger.debug update

    message = update.message || update.edited_message || update.callback_query
    @robot.logger.info "Receiving message_id: " + message.message_id

    # Text event
    if (message.text)
      text = @cleanMessageText message.text, message.chat.id

      @robot.logger.debug "Received message: " + message.from.username + " said '" + text + "'"

      user = @createUser message.from, message.chat
      @receive new TextMessage user, text, message.message_id
    # Callback query
    else if message.data
      text = @cleanMessageText message.data, message.message.chat.id

      @robot.logger.debug "Received callback query: " + message.from.username + " said '" + text + "'"

      user = @createUser message.from, message.message.chat

      @api.invoke 'answerCallbackQuery', {callback_query_id: message.id}, (err, result) ->
        if (err)
          self.emit 'error', err

      @receive new TextMessage user, text, message.message.message_id

    # Join event
    else if message.new_chat_member
      user = @createUser message.new_chat_member, message.chat
      @robot.logger.info "User " + user.id + " joined chat " + message.chat.id
      @receive new EnterMessage user, null, message.message_id

    # Exit event
    else if message.left_chat_member
      user = @createUser message.left_chat_member, message.chat
      @robot.logger.info "User " + user.id + " left chat " + message.chat.id
      @receive new LeaveMessage user, null, message.message_id

    # Chat topic event
    else if message.new_chat_title
      user = @createUser message.from, message.chat
      @robot.logger.info "User " + user.id + " changed chat " + message.chat.id + " title: " + message.new_chat_title
      @receive new TopicMessage user, message.new_chat_title, message.message_id

    else
      message.user = @createUser message.from, message.chat
      @receive new CatchAllMessage message

  run: ->
    self = @

    unless @token
      @emit 'error', new Error 'The environment variable "TELEGRAM_TOKEN" is required.'

    #Listen for Telegram API invokes from other scripts
    @robot.on "telegram:invoke", (method, opts, cb) ->
      self.api.invoke method, opts, cb

    if @webhook

      endpoint = @webhook + '/' + @token
      @robot.logger.debug 'Listening on ' + endpoint

      @api.invoke 'setWebHook', {url: endpoint}, (err, result) ->
        if (err)
          self.emit 'error', err

      @robot.router.post "/" + @token, (req, res) =>
        if req.body.message
          self.handleUpdate req.body

        res.send 'OK'

    else
      # Clear Webhook
      @api.invoke 'setWebHook', {url: ''}, (err, result) ->
        if (err)
          self.emit 'error', err

      setInterval ->
        self.api.invoke 'getUpdates', {offset: self.getLastOffset(), limit: 10}, (err, result) ->
          if (err)
            self.emit 'error', err
          else
            self.offset = result[result.length - 1].update_id if result.length

            for msg in result
              self.handleUpdate msg

      , @interval

    @robot.logger.info "Telegram Adapter Started..."
    @emit "connected"

exports.use = (robot) ->
  new Telegram robot
