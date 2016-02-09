#!/usr/bin/env node
var path = require("path");
var Tracker = require("./index.js");
var tracker = new Tracker();

if (!tracker.config) { 
	process.exit(1); 
}

var program = require('commander');


program
  .version(require(__dirname, "package.json").verion)
  .option('-c, --csv [date]', 'report as csv for the current month or for a given date MM.YYYY')
  .option('-v, --validate [date]', 'check the tracked time today or by a given date DD.MM.YYYY')
  .parse(process.argv);


if (program.csv === undefined && program.validate === undefined){
	tracker.toggle();
	tracker.save();
} else {
	if (program.validate){
		if (program.validate === true){
			tracker.reportByDay();
		} else {
			tracker.reportByDay(program.validate);
		}
	}
	if (program.csv){
		if (program.csv === true){
			tracker.reportAsCsv();
		} else {
			tracker.reportAsCsv(program.csv);
		}
	}
}