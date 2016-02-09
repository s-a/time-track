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
  .option('-r, --report [value]', 'report to excel')
  .option('-c, --check [value]', 'check the tracked time today')
  .parse(process.argv);


if (program.report === undefined && program.check === undefined){
	tracker.toggle();
	tracker.save();
} else {
	if (program.check){
		if (program.check === true){
			tracker.reportByDay();
		} else {
			tracker.reportByDay(program.check);
		}
	}
	if (program.report){
		if (program.report === true){
			tracker.reportByMonth();
		} else {
			tracker.reportByMonth(program.report);
		}
	}
}