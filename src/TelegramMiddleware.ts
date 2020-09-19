import { MiddlewareContext, NextFunction, DoneFunction } from 'hubot'
import { TelegramResponse } from './TelegramResponse'

/**
 * This middleware will enrich the Response class to expose some
 * telegram API methods.
 * @param adapter instance of TelegramAdapter
 */
export const telegramMiddleware = adapter => (
  context: MiddlewareContext,
  next: NextFunction,
  done: DoneFunction
): void => {
  const response = context.response as TelegramResponse

  // Haven't found a better way to do this...
  response.sendMessage = adapter.bot.sendMessage.bind(adapter.bot)
  response.sendAnimation = adapter.bot.sendAnimation.bind(adapter.bot)
  response.sendPhoto = adapter.bot.sendPhoto.bind(adapter.bot)
  response.sendAudio = adapter.bot.sendAudio.bind(adapter.bot)
  response.sendDocument = adapter.bot.sendDocument.bind(adapter.bot)
  response.sendMediaGroup = adapter.bot.sendMediaGroup.bind(adapter.bot)
  response.sendSticker = adapter.bot.sendSticker.bind(adapter.bot)
  response.sendVideo = adapter.bot.sendVideo.bind(adapter.bot)
  response.sendVideoNote = adapter.bot.sendVideoNote.bind(adapter.bot)
  response.sendVoice = adapter.bot.sendVoice.bind(adapter.bot)
  response.sendChatAction = adapter.bot.sendChatAction.bind(adapter.bot)

  next(() => done())
}
