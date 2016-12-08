# Cron

for espruino

```js
/*
      ╭─────────── second (0-59)
      │ ╭───────── minute (0-59)
      │ │ ╭─────── hour (0-23)
      │ │ │ ╭───── day of month (1-31)
      │ │ │ │ ╭─── month of year (1-12)
      │ │ │ │ │ ╭─ day of week (0-6 where 0 is sunday)
*/
cron('* * * * * *', () => {
  console.log('running job')
})


// Stopping jobs
var job = cron('* * * * * *', function () {})
job.stop()

```

## cron cheat sheet

`0 * * * * *` Every minute

`0 0/15 * * * *` Every fifteen minutes, starting at 0th minute

`0 0 0 * * *` Midnight (system time) every day

`0 0 7 * * 1-5` Every weekday morning at 7am system time

`0 0 18 * * 0,6` Every weekend evening at 6pm system time

## related espruino trick

set the system time to current time UTC with this snippet (may want to replace the url)
```js
http.get('http//icanhazip.com', function (res) {
  setTime(new Date(res.headers.Date)/1000);
});
```

### License

Copyright (c) 2016 Peter Brandt

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
