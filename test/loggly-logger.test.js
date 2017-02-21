'use strict'

const amqp = require('amqplib')

let should = require('should')
let cp = require('child_process')
let _channel = null
let _conn = null

let logglyLogger = null

describe('Loggly Logger', function () {
  before('init', () => {
    process.env.PORT = 8081
    process.env.INPUT_PIPE = 'demo.pipe.logger'
    process.env.BROKER = 'amqp://guest:guest@127.0.0.1/'
    process.env.CONFIG = '{"token": "243cffd1-4d8b-4061-8aaf-02604f5fa26d", "subdomain":"jcapiznon", "tags":"reekohtest", "logLevel":"info"}'


    amqp.connect('amqp://guest:guest@127.0.0.1/')
      .then((conn) => {
        _conn = conn
        return conn.createChannel()
      }).then((channel) => {
        _channel = channel
      }).catch((err) => {
        console.log(err)
      })
  })

  after('terminate child process', function (done) {
    this.timeout(8000)

    setTimeout(function () {
      logglyLogger.kill('SIGKILL')
      done()
    }, 5000)
  })

  describe('#spawn', function () {
    it('should spawn a child process', function () {
      should.ok(logglyLogger = cp.fork(process.cwd()), 'Child process not spawned.')
    })
  })


  describe('#logJSON', function () {
    it('handshake', function (done) {
      this.timeout(5000)
      logglyLogger.on('message', (msg) => {
        if (msg.type === 'ready') done()
      })
    })

    it('should process JSON log data', function (done) {
      let dummyData = {foo: 'reekohtest'}
      _channel.sendToQueue('demo.pipe.logger', new Buffer(JSON.stringify(dummyData)))

      done()
    })
  })
})
