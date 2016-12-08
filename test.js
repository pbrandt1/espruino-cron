
var cron = require('./cron.js')

var log_debug_messages = true

cron('2/10 * * * * *', function () {
  console.log('bamf ' + (new Date()).getSeconds())
}, log_debug_messages)
