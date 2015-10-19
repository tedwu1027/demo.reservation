var app = require('koa')()
var PORT = process.env.PORT || 8800
app.use(require('koa-static')('public'))
app.listen(PORT)
console.log('listening on port %s', PORT)
