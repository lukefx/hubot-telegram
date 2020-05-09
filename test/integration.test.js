const TelegrgramBot = require('node-telegram-bot-api')
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

xdescribe('Integration', () => {
  let robot
  let scope
  let getUpdates
  const Robot = require('hubot/es2015').Robot

  beforeEach(() => {
    scope = nock('https://api.telegram.org/bot1234')
    nock.disableNetConnect()
    scope.log(console.log)

    scope
      .persist()
      .post('/getMe')
      .reply(200, getMe)

    getUpdates = scope
      .persist()
      .post('/getUpdates')
      .reply(200, { ok: true, result: [] })

    scope
      .persist()
      .post('/sendMessage')
      .reply(200)

    process.env.TELEGRAM_TOKEN = '1234'
    // Robot initialization
    robot = new Robot('../src', 'telegram', false, 'TestBot')
    robot.alias = 'TestAliasBot'
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

  afterEach(() => {
    robot.shutdown()
    nock.cleanAll()
  })

  it('should receive a message', async done => {
    const receive = jest.spyOn(robot, 'receive')
    const send = jest.spyOn(robot, 'send')

    nock.removeInterceptor(getUpdates)
    scope
      .post('/getUpdates')
      .times(1)
      .reply(200, {
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
      })

    robot.hear(/start/, async res => {
      res.send('start')
      expect(res).toHaveProperty('sendMessage')
      expect(res.envelope.room).toBe(1234567890)
      expect(receive).toHaveBeenCalled()
      expect(send).toHaveBeenCalled()
      done()
    })
  })

  it('should reply a message', async done => {
    const receive = jest.spyOn(robot, 'receive')
    const reply = jest.spyOn(robot, 'reply')

    scope
      .post(/getUpdates$/)
      .times(1)
      .reply(200, {
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
              text: 'TestBot test'
            }
          }
        ]
      })

    robot.respond(/test/, res => {
      res.reply('test it is')
      expect(res.envelope.room).toBe(1234567890)
      expect(receive).toHaveBeenCalled()
      expect(reply).toHaveBeenCalled()
      done()
    })
  })
})
