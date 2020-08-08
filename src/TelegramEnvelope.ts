import { Envelope, User, Message } from 'hubot'

export interface TelegramEnvelope extends Envelope {
  telegram: Object
}
