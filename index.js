'use strict'

const co = require('co')
const Imap = require('./utils/inbox-wrapper')
const Slack = require('@slack/client')
const config = require('config')

const slack = new Slack.WebClient(config.get('slack.token'))
const imap = new Imap(config.get('imap'))

co(function * main () {
  yield imap.connect()
  console.log('connected')

  imap.on('new', (msg) => {
    const postData = {
      username: 'Mailbot',
      icon_emoji: ':email:',
      attachments: [{
        title: msg.subject,
        author_name: msg.from[0].name,
        text: msg.text
      }]
    }
    slack.chat.postMessage(config.get('slack.channel'), '', postData)
  })
})
