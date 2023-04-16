
async function errorHandler (ctx, next) {
  try {
    await next()
  } catch (err) {
    console.error(err.message)
    ctx.status = err.statusCode || err.status || 500
    ctx.body = {
      message: err.message
    }
  }
}

module.exports = errorHandler
