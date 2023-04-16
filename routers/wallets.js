const _ = require('lodash')
const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const { createError } = require('../utils/utils')

class WalletsRouter extends Router {
  constructor (options) {
    super()
    this.walletService = options.walletService
  }

  init (app) {
    this.get('/wallets', ctx => this.getWallets(ctx))
    this.post('/wallets', ctx => this.postWallet(ctx))
    this.post('/wallets/:id/funds', ctx => this.postWalletFund(ctx))
    this.post('/wallets/:id/sign', ctx => this.sign(ctx))
    app.use(this.routes())
  }

  async getWallets (ctx) {
    const wallets = await this.walletService.getWallets(ctx.user)
    ctx.status = 200
    ctx.body = wallets.map(wallet => this.formatWallet(wallet))
  }

  async postWallet (ctx) {
    const type = _.get(ctx, 'request.body.type')
    const invalidType = !(type === 'chequing' || type === 'saving')
    if (invalidType) throw createError('Wallet type must be chequing or saving', 400)

    const wallet = await this.walletService.createWallet(ctx.user, type)
    ctx.status = 201
    ctx.body = this.formatWallet(wallet)
  }

  async postWalletFund (ctx) {
    const amountInMinorUnit = _.get(ctx, 'request.body.amountInMinorUnit')
    const walletId = _.get(ctx, 'params.id')
    const wallet = await this.walletService.fundWallet(ctx.user, walletId, amountInMinorUnit)
    ctx.status = 201
    ctx.body = this.formatWallet(wallet)
  }

  async sign (ctx) {
    const body = _.get(ctx, 'request.body')

    const wallet = await this.walletService.getWallet(ctx.user, ctx.params.id)
    if (!wallet) {
      throw createError('Wallet not found', 404)
    }

    // For simplicity, we perform a symmetric signing with wallet_id as the secret key to sign the JWT
    ctx.body = { token: jwt.sign(body, wallet.id) }
    ctx.status = 201
  }

  formatWallet (wallet) {
    return _.pick(wallet.dataValues, ['id', 'type', 'balanceInMinorUnit', 'userId', 'createdAt', 'updatedAt'])
  }
}

module.exports = WalletsRouter
