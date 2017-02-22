'use strict'

let reekoh = require('reekoh')
let _plugin = new reekoh.plugins.Logger()
let domain = require('domain')
let winston = require('winston')
let isEmpty = require('lodash.isempty')

require('winston-loggly')

_plugin.on('log', (logData) => {
  let d = domain.create()

  d.once('error', (error) => {
    _plugin.logException(error)
    d.exit()
  })

  d.run(() => {
    let logLevel = _plugin.config.logLevel || 'info'

    if (logData.level) {
      logLevel = logData.level
      delete logData.level
    }

    winston.log(logLevel, logData, (error) => {
      if (error) {
        console.error('Error on Loggly.', error)
        _plugin.logException(error)
      }
      _plugin.log(JSON.stringify({
        title: 'Log sent to Loggly',
        data: logData
      }))

      d.exit()
    })
  })
})

_plugin.once('ready', () => {
  let tags = (isEmpty(_plugin.config.tags)) ? [] : _plugin.config.tags.split(' ')

  winston.add(winston.transports.Loggly, {
    token: _plugin.config.token,
    subdomain: _plugin.config.subdomain,
    tags: tags,
    json: true
  })

  _plugin.log('Loggly has been initialized.')
  process.send({ type: 'ready' })
})
