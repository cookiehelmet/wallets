const { DataTypes, Sequelize } = require('sequelize')
const User = require('./user.model')
const Wallet = require('./wallet.model')
const Transaction = require('./transaction.model')

async function initModels (sequelize) {
  await User.init({
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
    internalId: { type: DataTypes.INTEGER, autoIncrement: true },
    accessToken: { type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex' }
  }, {
    sequelize,
    modelName: 'User'
  })

  await Wallet.init({
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
    internalId: { type: DataTypes.INTEGER, autoIncrement: true },

    type: { type: DataTypes.STRING, allowNull: false },
    balanceInMinorUnit: { type: DataTypes.INTEGER, defaultValue: 0 },
    userId: { type: Sequelize.UUID, references: { model: User, key: 'id' } }
  }, {
    sequelize,
    modelName: 'Wallet'
  })

  await Transaction.init({
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
    internalId: { type: DataTypes.INTEGER, autoIncrement: true },

    amountInMinorUnit: { type: DataTypes.INTEGER, allowNull: false },
    fromWallet: { type: Sequelize.UUID, references: { model: Wallet, key: 'id' } },
    toWallet: { type: Sequelize.UUID, references: { model: Wallet, key: 'id' } },
    type: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'Transaction'
  })
}

module.exports = { initModels }
