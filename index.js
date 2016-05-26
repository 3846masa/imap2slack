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
    console.dir(msg, { depth: null })

    const postData = {
      username: 'Mailbot',
      icon_emoji: config.has('slack.icon') ? config.get('slack.icon') : ':email:',
      attachments: [{
        fallback: msg.subject,
        title: msg.subject,
        author_name: msg.from[0].address,
        text: msg.text
      }]
    }
    slack.chat.postMessage(config.get('slack.channel'), '', postData)
  })
})
