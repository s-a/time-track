# ![time-track](logo/logo-sm.png) timeTrack - A time tracking commandline app
Time is money, right? A few things that aims to help tracking your time. 

[![NPM Version](http://img.shields.io/npm/v/time-track.svg)](https://www.npmjs.org/package/time-track)
[![Build Status](https://travis-ci.org/s-a/time-track.svg)](https://travis-ci.org/s-a/time-track)
[![Coverage Status](https://coveralls.io/repos/github/s-a/time-track/badge.svg?branch=master)](https://coveralls.io/github/s-a/time-track?branch=master)
[![Codacy Badge](https://www.codacy.com/project/badge/9abe33d152db40bfa5833f2388b32646)](https://www.codacy.com/app/stephanahlf/time-track)
[![Dependency Status](https://david-dm.org/s-a/time-track.svg)](https://david-dm.org/s-a/time-track)
[![devDependency Status](https://david-dm.org/s-a/time-track/dev-status.svg)](https://david-dm.org/s-a/time-track#info=devDependencies)
[![NPM Downloads](https://img.shields.io/npm/dm/time-track.svg)](https://www.npmjs.org/package/time-track)
[![Massachusetts Institute of Technology (MIT)](https://s-a.github.io/license/img/mit.svg)](/LICENSE.md#mit)
[![Donate](http://s-a.github.io/donate/donate.svg)](http://s-a.github.io/donate/)




## Installation
```npm install time-track -g```

## Demo
![Demo](/demo.gif)

## Usage

```
 Usage: tt|time-track [options]

  Options:

    -h, --help                        output usage information
    -V, --version                     output the version number
    -l, --list                        list available projects
    -s, --switch [project]            create or switch to a given project name
    -i, --info [date]                 check the tracked time today or by a given date DD.MM.YYYY
    -S, --availableseconds [seconds]  set the available time for the current project in seconds
    -M, --availableminutes [minutes]  set the available time for the current project in minutes
    -H, --availablehours [hours]      set the available time for the current project in hours
    -D, --availabledays [days]        set the available time for the current project in days
    -o, --open                        open the app data folder
    -O, --opensystem                  open the system data folder
    -e, --edit                        open current project data storage json file in your editor
    -E, --editsystem                  open system data storage json file in your editor
    -r, --report [reporter]           reports tracked with a given reporter (reportername is optional and defaults to default-reporter.js)
    -t, --timerange [MM.YYYY]         optional timerange for the reporter
```

## Write your own reporter
Currently the default reporter log csv data to console. ```tt -r > myreport.csv``` will write a csv file down to filesystem.  
Check out the [default reporter](/lib/default-reporter.js) and create your own. Then use it with ```tt -r my-custom-reporter.js```.

## Available time of a project per month
Internaly measured in seconds a few reportings in timeTrack may need this information. You can set available time using the ```--available*``` parms. ***Keep in mind that this sets currently the available time of the current active project and the current month.*** If you want to change available time of another month then use --o to open the AppData folder and edit the ```.json``` files manualy.