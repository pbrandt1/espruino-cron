
var cron = require('./cron.es5.js')

var log_debug_messages = true

cron('0,10,20,30,40,50 * * * * *', function () {
  console.log('bamf ' + (new Date()).getSeconds())
}, log_debug_messages)
