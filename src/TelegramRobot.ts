import { Robot } from 'hubot'
import TelegramBot from 'node-telegram-bot-api'

export interface TelegramRobot extends Robot {
  telegram: TelegramBot
}
