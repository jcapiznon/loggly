'use strict'

const reekoh = require('reekoh')
const _plugin = new reekoh.plugins.Logger()

const domain = require('domain')
const winston = require('winston')
const isEmpty = require('lodash.isempty')

require('winston-loggly')

_plugin.on('log', (logData) => {
  console.log('-log-', logData)
  let d = domain.create()

  d.once('error', (error) => {
    console.log('-error-')
    console.error(error)
    _plugin.logException(error)
    d.exit()
  })

  d.run(() => {
    let logLevel = _plugin.config.logLevel || 'info'

    if (logData.level) {
      logLevel = logData.level
      delete logData.level
    }

    console.log('-run-', logLevel, logData)
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
  console.log('-ready-')
  let tags = (isEmpty(_plugin.config.tags)) ? [] : _plugin.config.tags.split(' ')

  winston.add(winston.transports.Loggly, {
    token: _plugin.config.token,
    subdomain: _plugin.config.subdomain,
    tags: tags,
    json: true
  })
  console.log(_plugin.config.token)
  _plugin.log('Loggly has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
