const User = require('../models/user.model')

async function authMiddleware (ctx, next) {
  const { authorization } = ctx.request.headers
  const accessToken = authorization && authorization.split(' ')[1]
  if (!accessToken) {
    ctx.status = 401
    ctx.body = { message: 'Unauthorized' }
    return
  }

  const user = await User.findOne({ where: { accessToken } })
  if (!user) {
    ctx.status = 401
    ctx.body = { message: 'Unauthorized' }
    return
  }
  ctx.user = user

  await next()
}

module.exports = authMiddleware
