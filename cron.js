'use strict';

function assert(val, msg) {
  if (!val) {
    throw new Error(msg || 'failed assertion');
  }
}

// i found that using Array.sort on arrays larger than 50 elements didn't work
// on the esp8266, but this does
function sort(ar) {
  var newa = [];
  ar.map(function (v) {
    var i = 0;
    if (newa.length === 0) {
      newa[0] = v;
      return;
    }

    while (newa[i] <= v) {
      i++;
    }
    newa.splice(i, 0, v);
  });

  return newa;
}

// expands "1-7" to "1,2,3,4,5,6,7"
function expandRange(p) {
  var start = parseInt(p.split('-')[0]);
  var end = parseInt(p.split('-')[1]);
  var a = [];
  for (var i = start; i <= end; i++) {
    a.push(i);
  }
  return a.join(',');
}

var jobs = {};

module.exports = function (pattern, callback, debug) {
  if (typeof debug === 'boolean' && debug) {
    debug = console.log.bind(console);
  } else {
    debug = function debug() {};
  }
  debug('Registering cron job for patterning ' + pattern);

  var id = Math.random().toString(32).slice(2);
  debug('id is ' + id);

  jobs[id] = {
    pattern: pattern,
    times: parse(pattern, debug),
    callback: callback
  };

  debug('t:');
  debug(jobs[id].times);

  setup(id, debug);

  return { stop: function stop() {
      delete jobs[id];
    } };
};

function parse(pattern, debug) {
  pattern = pattern.split(' ');
  debug(pattern);
  assert(pattern.length === 6, 'invalid cron pattern supplied (' + pattern + ')');

  // clean up the pattern
  pattern[0] = pattern[0].replace('*', '0-59');
  pattern[1] = pattern[1].replace('*', '0-59');
  pattern[2] = pattern[2].replace('*', '0-23');
  pattern[3] = pattern[3].replace('*', '1-31');
  pattern[4] = pattern[4].replace('*', '1-12');
  pattern[5] = pattern[5].replace('*', '0-6');

  debug('wow');
  debug(pattern);

  // convert to comma-separated list
  pattern = pattern.map(function (p) {
    if (p.indexOf('-') < 0) {
      return p;
    }

    return expandRange(p);
  });
  debug(pattern);

  // handle "0/15"
  pattern = pattern.map(function (p, i) {
    if (p.indexOf('/') < 0) {
      return p;
    }

    var start = parseInt(p.split('/')[0]);
    var interval = parseInt(p.split('/')[1]);
    var newp = expandRange(['0-59', '0-59', '0-23', '1-31', '1-12', '0-6'][i]);
    newp = newp.split(',').map(function (v) {
      return parseInt(v);
    }).filter(function (v) {
      return (v - start) % interval === 0;
    }).join(',');

    return newp;
  });
  return pattern.map(function (p) {
    return sort(p.split(',').map(function (v) {
      return parseInt(v);
    }));
  });
}

function setup(id, debug) {
  if (!jobs[id]) {
    return debug('exiting setup for ' + id);
  }

  // calculate the delay until the next time
  // use device timezone only
  var date = new Date();
  var t = jobs[id].times;

  var nowTimestamp = Math.floor(date.getTime());
  var nowSeconds = date.getSeconds();
  var nowMinutes = date.getMinutes();
  var nowMillis = date.getMilliseconds();

  var secondsFromNow;
  if (t[0][0] === 0 && nowSeconds === 59) {
    secondsFromNow = 1 - nowMillis/1000
  } else if (t[0].filter(function (v) {
    return v > nowSeconds;
  }).length > 0) {
    secondsFromNow = t[0].filter(function (v) {
      return v > nowSeconds;
    })[0] - nowSeconds - nowMillis/1000;
  } else {
    secondsFromNow = 60 - nowSeconds - nowMillis/1000 + t[0][0];
  }

  setTimeout(function () {
    var d = new Date();
    if (!jobs[id]) {
      return debug('will not run stopped job ' + id);
    }
    debug(['*', d.getMinutes(), d.getHours(), d.getDate(), d.getMonth(), d.getDay()].join(' '));
    var ok = t[1].indexOf(d.getMinutes()) >= 0 && t[2].indexOf(d.getHours()) >= 0 && t[3].indexOf(d.getDate()) >= 0 && t[4].indexOf(d.getMonth() + 1) >= 0 && t[5].indexOf(d.getDay()) >= 0;

    if (!ok) {
      debug('not running this minute ' + jobs[id].pattern);
      return setup(id, debug);
    }
    debug('running ' + id);
    jobs[id].callback();
    setup(id, debug);
  }, secondsFromNow * 1000);
}
