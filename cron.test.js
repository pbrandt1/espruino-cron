var cron = require('./cron.js')

test('runs every second exactly on the second, within 10 ms', (resolve) => {
  var i = 1;
  const job = cron('* * * * * *', function () {
    var d = new Date()
    expect(d.getMilliseconds()).toBeLessThan(10)

    if (i > 3) {
      job.stop()
      resolve()
    }
    i++;
  })
})
