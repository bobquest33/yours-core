/**
 * CoreContent
 * ===========
 *
 * A manager for content that can create new content and store it to the
 * database and retrieve content. It uses primiarily ContentAuth and
 * DBContentAuth. It is undecided whether it will also support unauthenticated
 * content. It is also undecided whether this class will have anything to do
 * with network connections - i.e. will it be used to broadcast new content?
 * Perhaps.
 */
'use strict'
let Content = require('./content')
let ContentAuth = require('./content-auth')
let DBContentAuth = require('./db-content-auth')
let Struct = require('fullnode/lib/struct')
let Keypair = require('fullnode/lib/keypair')

function CoreContent (db) {
  if (!(this instanceof CoreContent)) {
    return new CoreContent(db)
  }
  this.fromObject({
    db: db
  })
}

CoreContent.prototype = Object.create(Struct.prototype)
CoreContent.prototype.constructor = CoreContent

/**
 * Get recent content. TODO: This should *NOT* retrieve all content. It should
 * retrieve knowably recent content, i.e. content that signed the latest
 * blockhashbuf.
 */
CoreContent.prototype.asyncGetRecentContentAuth = function () {
  throw new Error('not implemented')
}

CoreContent.prototype.asyncNewContentAuth = function (pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum) {
  let content = Content(name, label, title, 'markdown', body)
  let contentbuf = content.toBuffer()

  let contentauth = ContentAuth().fromObject({
    blockhashbuf: blockhashbuf,
    blockheightnum: blockheightnum,
    address: address,
    contentbuf: contentbuf
  })
  let keypair = Keypair(privkey, pubkey)
  return contentauth.asyncSign(keypair)
}

/**
 * Create a new ContentAuth and save it to the db. TODO: Should we also
 * broadcast the data after storing it?
 */
CoreContent.prototype.asyncPostContentAuth = function (contentauth) {
  return DBContentAuth(this.db).save(contentauth)
}

/**
 * Make a new ContentAuth and post it. The easiest way to post new content.
 */
CoreContent.prototype.asyncPostNewContentAuth = function (pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum) {
  return this.asyncNewContentAuth(pubkey, privkey, address, name, label, title, body, blockhashbuf, blockheightnum).then(contentauth => {
    return this.asyncPostContentAuth(contentauth)
  })
}

module.exports = CoreContent