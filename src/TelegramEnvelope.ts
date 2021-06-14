import { Envelope } from 'hubot'

export interface TelegramEnvelope extends Envelope {
  telegram: any // not so great...
}
