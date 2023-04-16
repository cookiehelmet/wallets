
const { initModels } = require('./init')
const { Sequelize } = require('sequelize')
const User = require('./user.model')

async function seedData () {
  const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5433/postgres')
  await sequelize.authenticate()

  await initModels(sequelize)
  await sequelize.sync({ force: true })

  await User.create({ accessToken: '6YD3tFhTENnkwQn04ZD0NGiaqX0k7NlDnOT3xd11R0b0FkQYYZJ6jqBA6eq16x82' })
  await User.create({ accessToken: 'l9LVjxRo3LvLvj5x95fA1LFPQUC0WyTspE6lKhrYpWFBfj7OJcXSW2wB3A0yNEGl' })
}

seedData().then(() => {
  console.log('SeedData ran successfully')
}).catch(err => {
  console.error('SeedData failed', err)
})
