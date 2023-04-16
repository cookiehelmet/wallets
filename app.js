
const { initModels } = require('./models/init')
const { Sequelize } = require('sequelize')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const authMiddleware = require('./middlewares/auth')
const errorHandler = require('./middlewares/errorHandler')

// Routers
const WalletsRouter = require('./routers/wallets')
const TransactionsRouter = require('./routers/transactions')

// Services
const WalletService = require('./services/wallet')

async function start () {
  const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5433/postgres')
  await sequelize.authenticate()

  await initModels(sequelize)

  console.log('Connection has been established successfully')

  const app = new Koa()
  app.use(bodyParser())
  app.use(errorHandler)
  app.use(authMiddleware)

  const walletService = new WalletService({ sequelize })
  const walletsRouter = new WalletsRouter({ walletService })
  const transactionsRouter = new TransactionsRouter({ walletService })

  walletsRouter.init(app)
  transactionsRouter.init(app)

  app.listen(3000)
}

start().then(() => {
  console.log('App started successfully')
}).catch(err => {
  console.error('Unable to start the app', err)
})
