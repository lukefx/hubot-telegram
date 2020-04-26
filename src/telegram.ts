import Hubot from 'hubot'

// This is for avoiding the wrong comparison of TextMessage prototype at receiving time
const { TextMessage } = (require.main as any).require('hubot')

import TelegramBot from 'node-telegram-bot-api'
import legacyTelegrambot from 'telegrambot'
import { TelegramRobot } from './TelegramRobot'
import { TelegramEnvelope } from './TelegramEnvelope'
import { telegramMiddleware } from './TelegramMiddleware'

class TelegramAdapter extends Hubot.Adapter {
  token: string
  webhook: string
  autoMarkdown: string
  robot: TelegramRobot
  bot: TelegramBot

  constructor (robot: Hubot.Robot) {
    super(robot)
    this.robot = robot as TelegramRobot
    this.token = process.env['TELEGRAM_TOKEN'] || ''
    this.webhook = process.env['TELEGRAM_WEBHOOK'] || ''
    this.autoMarkdown = process.env['TELEGRAM_AUTO_MARKDOWN'] || 'enabled'
    this.robot.logger.info(`Telegram Adapter Bot ${this.token} Loaded...`)
    this.bot = new TelegramBot(this.token)

    // Get the bot information
    this.bot
      .getMe()
      .then((user: TelegramBot.User) => {
        this.robot.logger.info(`Telegram Bot Identified: ${user.first_name}`)
        if (user.first_name !== this.robot.name) {
          this.robot.logger.warning(
            'It is advised to use the same bot name as your Telegram Bot: ' +
              user.username
          )
          this.robot.logger.warning(
            'Having a different bot name can result in an inconsistent experience when using @mentions'
          )
        }
      })
      .catch((err: Error) => this.emit('error', err))

    this.handleUpdate = this.handleUpdate.bind(this)
    this.createUser = this.createUser.bind(this)
    this.cleanMessageText = this.cleanMessageText.bind(this)
  }

  send (envelope: TelegramEnvelope, ...strings: string[]): void {
    this.bot.sendMessage(envelope.room, strings.join(), envelope.telegram)
  }

  reply (envelope: TelegramEnvelope, ...strings: string[]): void {
    this.bot.sendMessage(envelope.room, strings.join(), {
      reply_to_message_id: Number(envelope.message.id)
    })
  }

  createUser (user: TelegramBot.User, chat: TelegramBot.Chat): Hubot.User {
    const currentUser: Hubot.User = new Hubot.User(String(user.id), {
      ...user,
      name: user.username,
      room: chat.id,
      telegram_chat: chat
    })
    return this.robot.brain.userForId(String(user.id), currentUser)
  }

  cleanMessageText (text: string, chat_id: Number) {
    // If it is a private chat, automatically prepend the bot name if it does not exist already.
    if (chat_id > 0) {
      // Strip out the stuff we don't need.
      text = text.replace(/^\//g, '').trim()
      text = text.replace(new RegExp('^@?' + this.robot.name, 'gi'), '')
      if (this.robot.alias) {
        text = text.replace(new RegExp('^@?' + this.robot.alias, 'gi'), '')
      }
      text = this.robot.name + ' ' + text.trim()
    } else {
      text = text.trim()
    }

    return text
  }

  private handleUpdate (
    message: TelegramBot.Message,
    metadata: TelegramBot.Metadata
  ): void {
    this.robot.logger.info(
      `Received text message in channel: ${message.chat.id}, from: ${message.from?.id}`
    )

    if (!message.from) {
      this.robot.logger.debug('I will take care of this later...')
      return
    }

    const messageId = String(message.message_id)
    if (message.text) {
      this.robot.logger.debug(
        `Received message: ${message.from.username} said '${message.text}'`
      )
      const text = this.cleanMessageText(message.text, message.chat.id)
      const user = this.createUser(message.from, message.chat)
      this.receive(new TextMessage(user, text, messageId))
    } else if (message.new_chat_members) {
      // new_chat_members is an array of users
      message.new_chat_members.map(u => {
        const user = this.createUser(u, message.chat)
        this.robot.logger.info(`User ${user.id} joined chat ${message.chat.id}`)
        this.receive(new Hubot.EnterMessage(user, false))
      })
    } else if (message.left_chat_member) {
      const user = this.createUser(message.left_chat_member, message.chat)
      this.robot.logger.info(`User ${user.id} left chat ${message.chat.id}`)
      this.receive(new Hubot.LeaveMessage(user, false))
    } else if (message.new_chat_title) {
      const user = this.createUser(message.from, message.chat)
      this.robot.logger.info(
        `User ${user.id} changed chat ${message.chat.id} title: ${message.new_chat_title}`
      )
      this.receive(
        new Hubot.TopicMessage(user, message.new_chat_title, messageId)
      )
    } else {
      const user = this.createUser(message.from, message.chat)
      const msg = new Hubot.Message(user, false)
      this.receive(new Hubot.CatchAllMessage(msg))
    }
  }

  run (): void {
    if (!this.token) {
      this.emit(
        'error',
        new Error('The environment variable "TELEGRAM_TOKEN" is required.')
      )
    }

    if (this.webhook) {
      const endpoint = this.webhook + '/' + this.token
      this.robot.logger.debug(`Listening on ${endpoint}`)
      this.bot.setWebHook(endpoint)

      this.robot.router.post(`/${this.token}`, (req, res) => {
        if (req.body.message) {
          this.bot.processUpdate(req.body)
        }
        res.status(200)
      })
    } else {
      this.robot.logger.debug('Start polling APIs...')
      this.bot.startPolling()
    }

    // Listen for Telegram API invokes from other scripts
    this.robot.on('telegram:invoke', (method, opts, cb) => {
      const api = new legacyTelegrambot(this.token)
      api.invoke(method, opts, cb)
    })

    // Exposing the telegram lib to the robot interface
    this.robot.telegram = this.bot

    // Registering events
    this.bot.on('error', (err: Error) => this.emit('error', err))
    this.bot.on('message', this.handleUpdate)

    this.robot.logger.info('Telegram Adapter Started...')
    this.emit('connected')
  }
}

module.exports.use = (robot: Hubot.Robot) => {
  const adapter = new TelegramAdapter(robot)
  robot.listenerMiddleware(telegramMiddleware(adapter))
  return adapter
}
