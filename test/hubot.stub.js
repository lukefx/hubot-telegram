const { EventEmitter } = require('events')

class FakeRobot extends EventEmitter {
  constructor () {
    super()
    this.name = 'TestBot'
    this.alias = 'TestAliasBot'
    this.logger = console
    this.receive = jest.fn()
    this.brain = {
      userForId: jest.fn((id, options) => {
        return Object.assign({ id }, options)
      })
    }
    this.listenerMiddleware = jest.fn()
  }
}

module.exports = FakeRobot
