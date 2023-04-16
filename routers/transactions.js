const _ = require('lodash')
const Router = require('koa-router')
const { createError } = require('../utils/utils')

class TransactionsRouter extends Router {
  constructor (options) {
    super()
    this.walletService = options.walletService
  }

  init (app) {
    this.post('/transactions', ctx => this.postTransaction(ctx))
    app.use(this.routes())
  }

  async postTransaction (ctx) {
    const fromWalletId = _.get(ctx, 'request.body.fromWalletId')
    const toWalletId = _.get(ctx, 'request.body.toWalletId')
    const amountInMinorUnit = _.get(ctx, 'request.body.amountInMinorUnit')
    this.validate_params({ fromWalletId, toWalletId, amountInMinorUnit })

    const transaction = await this.walletService.transfer(ctx.user, fromWalletId, toWalletId, amountInMinorUnit)
    ctx.status = 201
    ctx.body = transaction
  }

  validate_params ({ fromWalletId, toWalletId, amountInMinorUnit }) {
    if (!fromWalletId || !toWalletId || !amountInMinorUnit) {
      throw createError('Missing required params', 400)
    }
  }

  formatTransaction (transaction) {
    return _.pick(transaction.dataValues, ['id', 'type', 'balanceInMinorUnit', 'userId', 'createdAt', 'updatedAt'])
  }
}

module.exports = TransactionsRouter
