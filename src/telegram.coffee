{Robot, Adapter, TextMessage, EnterMessage, LeaveMessage, TopicMessage, User} = require 'hubot'
telegrambot = require 'telegrambot'

class Telegram extends Adapter

    constructor: ->
        super
        self = @

        @token      = process.env['TELEGRAM_TOKEN']
        @webhook    = process.env['TELEGRAM_WEBHOOK']
        @interval   = process.env['TELEGRAM_INTERVAL'] || 2000
        @offset     = 0
        @api        = new telegrambot(@token)

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
    # @param int    chat_id
    #
    # @return object
    ###
    createUser: (user, chat_id) ->
        return @robot.brain.userForId user.id, name: user.username, room: chat_id

    ###*
    # Send a message to a specific room via the Telegram API
    ###
    send: (envelope, strings...) ->
        self = @

        @api.invoke 'sendMessage', { chat_id: envelope.room, text: strings.join() }, (err, message) =>

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

        @api.invoke 'sendMessage', { chat_id: envelope.room, text: strings.join(), reply_to_message_id: envelope.message.id }, (err, message) =>

            if (err)
                self.emit 'error', err
            else
                self.robot.logger.info "Reply message to room/message: " + envelope.room + "/" + envelope.id

    ###*
    # "Private" method to handle a new update received via a webhook
    # or poll update.
    ###
    handleUpdate: (update) ->

        message = update.message
        @robot.logger.info "Receiving message_id: " + message.message_id

        # Text event
        if (message.text)
            text = message.text

            # If we are running in privacy mode, strip out the stuff we don't need.
            text = text.replace(/^\//g, '')

            @robot.logger.debug "Received message: " + message.from.username + " said '" + text + "'"

            user = @createUser message.from, message.chat.id
            @receive new TextMessage user, text, message.message_id

        # Join event
        else if message.new_chat_participant
            user = @createUser message.new_chat_participant, message.chat.id
            @robot.logger.info "User " + user.id + " joined chat " + message.chat.id
            message = new EnterMessage user, null, message.message_id

        # Exit event
        else if message.left_chat_participant
            user = @createUser message.left_chat_participant, message.chat.id
            @robot.logger.info "User " + user.id + " left chat " + message.chat.id
            message = new LeaveMessage user, null, message.message_id

        # Chat topic event
        else if message.new_chat_title
            user = @createUser message.from, message.chat.id
            @robot.logger.info "User " + user.id + " changed chat " + message.chat.id + " title: " + message.new_chat_title
            message = new TopicMessage user, message.new_chat_title, message.message_id

        # Increment the current offset
        @offset = update.update_id

    run: ->
        self = @

        unless @token
            @emit 'error', new Error 'The environment variable "TELEGRAM_TOKEN" is required.'

        if @webhook

            @api.invoke 'setWebHook', { url: @webhook }, (err, result) ->
                if (err)
                    self.emit 'error', err

            @robot.router.post "/hubot/telegram/receive", (req, res) =>
                for msg in req.body.result
                    self.handleUpdate msg

        else
            setInterval ->

                self.api.invoke 'getUpdates', { offset: self.getLastOffset(), limit: 10 }, (err, result) ->

                    if (err)
                        self.emit 'error', err
                    else
                        for msg in result
                            self.handleUpdate msg

            , @interval

        @robot.logger.info "Telegram Adapter Started..."
        @emit "connected"

exports.use = (robot) ->
    new Telegram robot