#!/usr/bin/env node
var program = require("commander");
var Tracker = require("./index.js");
var path = require("path");
var PrettyError = require('pretty-error');

program
  .version(require(path.join(__dirname, "..", "package.json")).version)
  .option("-l, --list", "list available projects")
  .option("-s, --switch [project]", "create or switch to a given project name")
  .option("-i, --info [date]", "check the tracked time today or by a given date DD.MM.YYYY")
  .option("-S, --availableseconds [seconds]", "set the available time for the current project in seconds")
  .option("-M, --availableminutes [minutes]", "set the available time for the current project in minutes")
  .option("-H, --availablehours [hours]", "set the available time for the current project in hours")
  .option("-D, --availabledays [days]", "set the available time for the current project in days")
  .option("-o, --open", "open the app data folder")
  .option("-O, --opensystem", "open the system data folder")
  .option("-e, --edit", "open current project data storage json file in your editor")
  .option("-E, --editsystem", "open system data storage json file in your editor")
  .option("-r, --report [reporter]", "reports tracked with a given reporter (reportername is optional and defaults to default-reporter.js)")
  .option("-t, --timerange [MM.YYYY]", "optional timerange for the reporter")
  .parse(process.argv);

var optionsPassed = (process.argv.length > 2);

try{

	var tracker = new Tracker(program);

	if (!optionsPassed){
		if (tracker.config) {
			return tracker.toggle();
		}
	} else {

		if (program.info){
			if (program.info === true){
				return tracker.reportByDay();
			} else {
				return tracker.reportByDay(program.info);
			}
		}

		if (program.edit){
			return tracker.editAppDataJSON();
		}

		if (program.editsystem){
			return tracker.editSystemDataJSON();
		}

		if (program.open){
			return tracker.openAppDataFolder();
		}

		if (program.opensystem){
			return tracker.openSystemDataFolder();
		}

		if (program.list){
			return tracker.listProjects();
		}

		if (program.switch){
			return tracker.switchProject(program.switch);
		}

		if (program.availableseconds || program.availableminutes || program.availablehours || program.availabledays){
			return tracker.setAvailableWorkTime();
		}

		if (program.report){
			return tracker.report(program.report);
		}

	}
} catch(e){
	var pe = new PrettyError();
	pe.skipNodeFiles();
	var renderedError = pe.render(e);
	console.log(renderedError);
}
