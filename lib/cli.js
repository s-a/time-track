#!/usr/bin/env node
var Tracker = require("./index.js");
var colors = require("colors/safe");

var program = require("commander");


program
  .version(require(__dirname, "package.json").verion)
  .option("-l, --list", "list available projects")
  .option("-s, --switch [project]", "create or switch to a given project name")
  .option("-v, --validate [date]", "check the tracked time today or by a given date DD.MM.YYYY")
  .option("-c, --csv [date]", "report as csv for the current month or for a given date MM.YYYY")
  .option("-S, --availableseconds [seconds]", "set the available time for the current project in seconds")
  .option("-M, --availableminutes [minutes]", "set the available time for the current project in minutes")
  .option("-H, --availablehours [hours]", "set the available time for the current project in hours")
  .option("-D, --availabledays [days]", "set the available time for the current project in days")
  .option("-o, --open", "open the app data folder")
  .option("-O, --opensystem", "open the system data folder")
  .option("-e, --edit", "open current project data storage json file in your editor")
  .option("-E, --editsystem", "open system data storage json file in your editor")
  .parse(process.argv);

var optionsPassed = (process.argv.length > 2);


var error = function  (msg) {
	console.error(colors.red(msg));
	process.exit(1);
};

try{

	var tracker = new Tracker(program, error);

	if (!optionsPassed){
		if (tracker.config) {
			tracker.toggle();
			tracker.save();
		}
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

		if (program.edit){
			tracker.editAppDataJSON();
		}

		if (program.editsystem){
			tracker.editSystemDataJSON();
		}

		if (program.open){
			tracker.openAppDataFolder();
		}

		if (program.opensystem){
			tracker.openSystemDataFolder();
		}

		if (program.list){
			tracker.listProjects();
		}

		if (program.switch){
			tracker.switchProject(program.switch);
		}

		if (program.availableseconds || program.availableminutes || program.availablehours || program.availabledays){
			tracker.setAvailableWorkTime();
		}

	}
} catch(e){
	console.log(e);
}