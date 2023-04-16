const { createError } = require('../utils/utils')
const Wallet = require('../models/wallet.model')
const Transaction = require('../models/transaction.model')

class WalletService {
  constructor ({ sequelize }) {
    this.sequelize = sequelize
  }

  async getWallets (user) {
    return Wallet.findAll({ where: { userId: user.id } })
  }

  async getWallet (user, walletId) {
    return Wallet.findOne({ where: { id: walletId, userId: user.id } })
  }

  async getWalletById (walletId) {
    return Wallet.findOne({ where: { id: walletId } })
  }

  async createWallet (user, type) {
    const wallet = Wallet.create({ type, userId: user.id })
    return wallet
  }

  async fundWallet (user, walletId, amountInMinorUnit) {
    let wallet = await this.getWallet(user, walletId)
    if (!wallet) {
      throw createError('Wallet not found', 404)
    }

    const result = await this.sequelize.transaction(async (t) => {
      wallet = await wallet.increment('balanceInMinorUnit', { by: amountInMinorUnit })
      await Transaction.create({ toWallet: wallet.id, amountInMinorUnit, type: 'fund' })

      return wallet
    })

    return result
  }

  async transfer (user, fromWalletId, toWalletId, amountInMinorUnit) {
    const fromWallet = await this.getWallet(user, fromWalletId)
    const toWallet = await this.getWalletById(toWalletId)
    if (!fromWallet || !toWallet) {
      throw createError('Wallet not found', 404)
    }
    if (fromWallet.balanceInMinorUnit < amountInMinorUnit) {
      throw createError('Insufficient balance', 404)
    }

    const result = await this.sequelize.transaction(async (t) => {
      await fromWallet.decrement('balanceInMinorUnit', { by: amountInMinorUnit })
      await toWallet.increment('balanceInMinorUnit', { by: amountInMinorUnit })
      const transaction = await Transaction.create({ fromWallet: fromWallet.id, toWallet: toWallet.id, amountInMinorUnit, type: 'transfer' })

      return transaction
    })

    return result
  }
}

module.exports = WalletService
