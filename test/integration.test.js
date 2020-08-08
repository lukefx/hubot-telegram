const nock = require('nock')

const getMe = {
  result: {
    id: 0,
    username: 'TestBot',
    first_name: 'TestBot',
    language_code: 'en',
    is_bot: true
  },
  ok: true
}

describe('Integration', () => {
  let robot
  let scope

  let payload = {
    ok: true,
    result: []
  }

  const Robot = require('hubot/es2015').Robot

  beforeEach(() => {
    scope = nock('https://api.telegram.org/bot1234')
    nock.disableNetConnect()

    scope
      .persist()
      .post('/getMe')
      .reply(200, getMe)

    scope
      .persist()
      .post('/getUpdates')
      .reply(200, () => payload)

    scope
      .persist()
      .post('/sendMessage')
      .reply(200, { ok: true })

    process.env.TELEGRAM_TOKEN = '1234'
    process.env.TELEGRAM_INTERVAL = 1000

    // Robot initialization
    robot = new Robot('../src', 'telegram', false, 'TestBot', 'TestAliasBot')
    robot.run()

    // Re-throw AssertionErrors for clearer test failures
    robot.on('error', (name, err, response) => {
      if (!err && !err.constructor) {
        return
      }
      if (err.constructor.name == 'AssertionError') {
        process.nextTick(() => {
          throw err
        })
      }
    })
  })

  afterEach(() => robot.shutdown())

  it('should receive a message', async done => {
    const receive = jest.spyOn(robot, 'receive')
    const send = jest.spyOn(robot.adapter, 'send')

    payload = {
      ok: true,
      result: [
        {
          update_id: 123456789,
          message: {
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
            text: 'start'
          }
        }
      ]
    }

    robot.hear(/start/, async res => {
      await res.send('start')
      expect(res).toHaveProperty('sendMessage')
      expect(res.envelope.room).toBe(1234567890)
      expect(receive).toHaveBeenCalled()
      expect(send).toHaveBeenCalled()
      done()
    })
  })

  it('should reply a message', async done => {
    const receive = jest.spyOn(robot, 'receive')
    const reply = jest.spyOn(robot.adapter, 'reply')

    payload = {
      ok: true,
      result: [
        {
          update_id: 123456789,
          message: {
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
            text: 'TestBot test it is'
          }
        }
      ]
    }

    robot.respond(/test/, async res => {
      await res.reply('test it is')
      expect(res.envelope.room).toBe(1234567890)
      expect(receive).toHaveBeenCalled()
      expect(reply).toHaveBeenCalled()
      done()
    })
  })
})
