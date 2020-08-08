process.env.TELEGRAM_TOKEN = '1234'

const FakeRobot = require('./hubot.stub')
const robot = new FakeRobot()

const sendMessage = jest.fn(() => Promise.resolve())

jest.mock('node-telegram-bot-api', () => {
  return jest.fn().mockImplementation(() => ({
    getMe: jest.fn(() =>
      Promise.resolve({
        id: 1,
        first_name: robot.name,
        username: robot.name
      })
    ),
    sendMessage
  }))
})

const telegram = require('./../src/telegram').use(robot)

describe('Telegram', function () {
  describe('#cleanMessageText()', function () {
    // eg. ship it => BotName ship it
    it('private chat: should auto prepend the bot name to message text', function () {
      var input = 'ship it'
      var text = telegram.cleanMessageText(input, 1)
      expect(text).toBe(robot.name + ' ' + input)
    })

    // eg. BotName ship it => BotName ship it
    it('private chat: should not prepend bot name if has already been provided', function () {
      var input = 'ship it'
      var text = telegram.cleanMessageText(robot.name + ' ' + input, 1)
      expect(text).toBe(robot.name + ' ' + input)

      var text = telegram.cleanMessageText(
        robot.name.toLowerCase() + ' ' + input,
        1
      )
      expect(text).toBe(robot.name + ' ' + input)

      var text = telegram.cleanMessageText(
        '@' + robot.name.toLowerCase() + ' ' + input,
        1
      )
      expect(text).toBe(robot.name + ' ' + input)
    })

    // eg. BotAliasName ship it => BotAliasName ship it
    it('private chat: should not prepend bot name if an alias has already been provided', function () {
      var input = 'ship it'
      var text = telegram.cleanMessageText(robot.alias + ' ' + input, 1)
      expect(text).toBe(robot.name + ' ' + input)

      var text = telegram.cleanMessageText(
        robot.alias.toLowerCase() + ' ' + input,
        1
      )

      expect(text).toBe(robot.name + ' ' + input)
      var text = telegram.cleanMessageText(
        '@' + robot.alias.toLowerCase() + ' ' + input,
        1
      )
      expect(text).toBe(robot.name + ' ' + input)
    })
  })

  describe('#createUser()', function () {
    it('should use the new user object if the first_name or last_name changed', function () {
      telegram.robot.brain.data = { users: [] }

      telegram.robot.brain.userForId = jest.fn((id, user) => {
        telegram.robot.brain.data.users[id] = user
        return telegram.robot.brain.data.users[id]
      })

      var original = {
        id: 1234,
        first_name: 'Firstname',
        last_name: 'Surname',
        username: 'username'
      }

      var user = {
        id: 1234,
        first_name: 'Updated',
        last_name: 'Surname',
        username: 'username'
      }

      var result = telegram.createUser(original, 1)
      expect(original.first_name).toBe(result.first_name)

      var result = telegram.createUser(user, 1)
      expect(user.first_name).toBe(result.first_name)
    })

    it('should use the new user object if the username changed', function () {
      telegram.robot.brain.data = { users: [] }

      telegram.robot.brain.userForId = jest.fn((id, user) => {
        telegram.robot.brain.data.users[id] = user
        return telegram.robot.brain.data.users[id]
      })

      var original = {
        id: 1234,
        first_name: 'Firstname',
        last_name: 'Surname',
        username: 'old'
      }

      var user = {
        id: 1234,
        first_name: 'Firstname',
        last_name: 'Surname',
        username: 'username'
      }

      var result = telegram.createUser(user, 1)
      expect(user.username).toBe(result.username)
    })
  })

  describe('#send()', function () {
    it('should call sendMessage', function () {
      var message = ''
      for (var i = 0; i < 4096; i++) message += 'a'
      telegram.send({ room: 1 }, message)
      expect(sendMessage).toHaveBeenCalledTimes(1)
    })
  })

  describe('#handleUpdate()', function () {
    it('should handle a message update', function () {
      telegram.handleUpdate(
        {
          message_id: 1,
          from: {
            id: 1234567890,
            first_name: 'John',
            last_name: 'Doe',
            username: 'JohnDoe'
          },
          chat: {
            id: 1234567890,
            first_name: 'John',
            last_name: 'Doe',
            username: 'JohnDoe',
            type: 'private'
          },
          date: 1459957719,
          text: 'hello'
        },
        { type: 'text' }
      )
      expect(robot.receive).toHaveBeenCalledTimes(1)
    })
  })
})
