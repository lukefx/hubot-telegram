import { Response } from 'hubot'
import * as TelegramBot from 'node-telegram-bot-api'
import { Stream } from 'stream'

export interface TelegramResponse extends Response {
  sendMessage(
    chatId: number | string,
    text: string,
    options?: TelegramBot.SendMessageOptions
  ): Promise<TelegramBot.Message>
  sendPhoto(
    chatId: number | string,
    photo: string | Stream | Buffer,
    options?: TelegramBot.SendPhotoOptions
  ): Promise<TelegramBot.Message>
  sendAudio(
    chatId: number | string,
    audio: string | Stream | Buffer,
    options?: TelegramBot.SendAudioOptions
  ): Promise<TelegramBot.Message>
  sendDocument(
    chatId: number | string,
    doc: string | Stream | Buffer,
    options?: TelegramBot.SendDocumentOptions,
    fileOpts?: any
  ): Promise<TelegramBot.Message>
  sendMediaGroup(
    chatId: number | string,
    media: ReadonlyArray<TelegramBot.InputMedia>,
    options?: TelegramBot.SendMediaGroupOptions
  ): Promise<TelegramBot.Message>
  sendSticker(
    chatId: number | string,
    sticker: string | Stream | Buffer,
    options?: TelegramBot.SendStickerOptions
  ): Promise<TelegramBot.Message>
  sendVideo(
    chatId: number | string,
    video: string | Stream | Buffer,
    options?: TelegramBot.SendVideoOptions
  ): Promise<TelegramBot.Message>
  sendVideoNote(
    chatId: number | string,
    videoNote: string | Stream | Buffer,
    options?: TelegramBot.SendVideoNoteOptions
  ): Promise<TelegramBot.Message>
  sendVoice(
    chatId: number | string,
    voice: string | Stream | Buffer,
    options?: TelegramBot.SendVoiceOptions
  ): Promise<TelegramBot.Message>
  sendChatAction(
    chatId: number | string,
    action: TelegramBot.ChatAction
  ): Promise<boolean>
}
