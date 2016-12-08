function assert(val, msg) {
  if (!val) {
    throw new Error(msg || 'failed assertion')
  }
}

var jobs = {}

module.exports = function(pattern, callback, debug) {
  if (typeof debug === 'boolean' && debug) {
    debug = console.log.bind(console)
  } else {
    debug = function() {};
  }
  debug('Registering cron job for patterning ' + pattern);

  var id = Math.random().toString(32).slice(2)
  debug('id is ' + id);

  jobs[id] = {
    pattern: pattern,
    times: parse(pattern, debug),
    callback: callback,
  };

  debug('t:')
  debug(jobs[id].times)

  setup(id, debug)

  return { stop: function() {
    delete jobs[id]
  }}
}

function parse(pattern, debug) {
  pattern = pattern.split(' ')
  debug(pattern);
  assert(pattern.length === 6, 'invalid cron pattern supplied (' + pattern + ')')

  // clean up the pattern
  pattern[0] = pattern[0].replace('*', '0-59')
  pattern[1] = pattern[1].replace('*', '0-59')
  pattern[2] = pattern[2].replace('*', '0-23')
  pattern[3] = pattern[3].replace('*', '1-31')
  pattern[4] = pattern[4].replace('*', '1-12')
  pattern[5] = pattern[5].replace('*', '0-6')

  debug('wow')
  debug(pattern)

  // convert to comma-separated list
  pattern = pattern.map(p => {
    if (p.indexOf('-') < 0) {
      return p
    }

    var start = parseInt(p.split('-')[0])
    var end = parseInt(p.split('-')[1])
    var a = [];
    for (var i = start; i <= end; i++) {
      a.push(i);
    }
    return a.join(',')
  })
  debug(pattern)
  return pattern.map(p => p.split(',').map(v => parseInt(v)).sort((n1, n2) => n1 - n2))

}

function setup(id, debug) {
  if (!jobs[id]) {
    return debug('exiting setup for ' + id)
  }

  // calculate the delay until the next time
  // use device timezone only
  var date = new Date()
  var t = jobs[id].times

  var nowTimestamp = Math.floor(date.getTime())
  var nowSeconds = date.getSeconds()
  var nowMinutes = date.getMinutes()

  var secondsFromNow
  if (t[0][0] === 0 && nowSeconds === 59) {
    secondsFromNow = 1
  } else if (t[0].filter(v => v > nowSeconds).length > 0) {
    secondsFromNow = t[0].filter(v => v > nowSeconds)[0] - nowSeconds
  } else {
    secondsFromNow = 60 - nowSeconds + t[0][0]
  }

  setTimeout(() => {
    var d = new Date()
    if (!jobs[id]) {
      return debug('will not run stopped job ' + id)
    }
    debug(['*', d.getMinutes(), d.getHours(), d.getDate(), d.getMonth(), d.getDay()].join(' '))
    var ok = t[1].indexOf(d.getMinutes())>= 0
      && t[2].indexOf(d.getHours()) >= 0
      && t[3].indexOf(d.getDate()) >= 0
      && t[4].indexOf(d.getMonth() + 1) >= 0
      && t[5].indexOf(d.getDay()) >= 0

    if (!ok) {
      debug('not running this minute ' + jobs[id].pattern)
      return setup(id, debug)
    }
    debug('running ' + id)
    jobs[id].callback()
    setup(id, debug)
  }, secondsFromNow * 1000)
}
