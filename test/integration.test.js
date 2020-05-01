describe('Robot', () => {
  let hubot
  const Hubot = require('hubot/es2015')

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.TELEGRAM_TOKEN = '1234'
    hubot = new Hubot.Robot('../src', 'telegram', true, 'TestBot')
    hubot.alias = 'TestAliasBot'
    hubot.run()
  })

  afterEach(() => {
    hubot.server.close()
    hubot.shutdown()
  })

  it('should not fail', () => {
    hubot.respond(/test/, res => {
      expect(res).toHaveProperty('sendMessage')
    })

    hubot.adapter.handleUpdate(
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
        text: 'test'
      },
      { type: 'text' }
    )
  })
})
