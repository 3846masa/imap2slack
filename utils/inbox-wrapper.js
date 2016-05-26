'use strict'

const inbox = require('inbox')
const pify = require('pify')
const EventEmitter = require('events')
const MailParser = require('mailparser').MailParser

class Imap extends EventEmitter {

  constructor ({
    port, host, tls, user, password
  }) {
    super()
    this.imap = inbox.createConnection(port, host, {
      secureConnection: tls,
      auth: { user: user, pass: password }
    })
  }

  connect () {
    return new Promise((resolve, reject) => {
      this.imap.once('connect', () => {
        pify(this.imap.openMailbox.bind(this.imap))('INBOX', { readOnly: true })
        .then(resolve).catch(reject)
      })
      this.imap.connect()
    })
  }

  on (evName, listener) {
    if (evName === 'new') {
      return this._onNew(listener)
    } else {
      this.imap.on(evName, super.emit.bind(this, evName))
      return super.on(evName, listener)
    }
  }

  _onNew (listener) {
    this.imap.on('new', (msg) => {
      this.imap.createMessageStream(msg.UID)
        .pipe(new MailParser())
        .on('end', super.emit.bind(this, 'new'))
    })
    return super.on('new', listener)
  }
}

module.exports = Imap
