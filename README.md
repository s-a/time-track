# ![time-track](logo/logo-sm.png) timeTrack
A time-tracking commandline app.

[![NPM Version](http://img.shields.io/npm/v/time-track.svg)](https://www.npmjs.org/package/time-track)
[![Build Status](https://travis-ci.org/s-a/time-track.svg)](https://travis-ci.org/s-a/time-track)
[![Coverage Status](https://coveralls.io/repos/github/s-a/time-track/badge.svg?branch=master)](https://coveralls.io/github/s-a/time-track?branch=master)
[![Codacy Badge](https://www.codacy.com/project/badge/9abe33d152db40bfa5833f2388b32646)](https://www.codacy.com/app/stephanahlf/time-track)
[![Dependency Status](https://david-dm.org/s-a/time-track.svg)](https://david-dm.org/s-a/time-track)
[![devDependency Status](https://david-dm.org/s-a/time-track/dev-status.svg)](https://david-dm.org/s-a/time-track#info=devDependencies)
[![NPM Downloads](https://img.shields.io/npm/dm/time-track.svg)](https://www.npmjs.org/package/time-track)
[![Massachusetts Institute of Technology (MIT)](https://s-a.github.io/license/img/mit.svg)](/LICENSE.md#mit)
[![Donate](http://s-a.github.io/donate/donate.svg)](http://s-a.github.io/donate/)


```npm install time-track -g```

```shell
  Usage: tt [options]

  Options:

    -h, --help                        output usage information
    -V, --version                     output the version number
    -c, --csv [date]                  report as csv for the current month or for a given date MM.YYYY
    -v, --validate [date]             check the tracked time today or by a given date DD.MM.YYYY
    -l, --list                        list available projects
    -s, --switch [project]            create or switch to a given project name
    -S, --availableseconds [seconds]  set the available time for the current project in seconds
    -M, --availableminutes [minutes]  set the available time for the current project in minutes
    -H, --availablehours [hours]      set the available time for the current project in hours
    -D, --availabledays [days]        set the available time for the current project in days
    -o, --open                        open the app data folder
    -O, --opensystem                  open the system data folder
    -e, --edit                        open current data storage json file in your editor
    -E, --editsystem                  open system data storage json file in your editor
```  



todo:  
 - add a 2nd shell command alias ```time-track```
 - write reporters (time range optional)
 - mark avialable project time as optional.
 - new .option("-t, --timerange [from-to]", "(optional) reports tracked with tracked time by range range for the --report [DD.MM.YYYY[-DD.MM.YYYY]]")
 - add --format (output format)
 - add --info reports in a short human readable form (replaces --validate)