var path = require("path");
var fse = require("fs-extra");
/* jshint ignore:start */
// Code here will be ignored by JSHint.
var should = require("should");
/* jshint ignore:end */
var projectName = "mocha-test";
var tk = require('timekeeper');
var TimeTrackDateValue;
var TimeTrackTimeValue;

var Tracker;
try {
	Tracker = require("./../lib-cov/index.js");
	TimeTrackDateValue = require("./../lib-cov/time-track-date-value.js");
	TimeTrackTimeValue = require("./../lib-cov/time-track-time-value.js");
} catch(e){
	Tracker = require("./../lib/index.js");
	TimeTrackDateValue = require("./../lib/time-track-date-value.js");
	TimeTrackTimeValue = require("./../lib/time-track-time-value.js");
}




/*
if (process.env.TRAVIS && process.env.NODE_ENV === "test" && process.env.COVERAGE === "1" ){
} else {
}
*/


require('mocha-jshint')(
	{
		paths: [
			"lib",
			"test"
		]
	}
);


describe("Clean machine", function(){

	it("should remove all testing app data folders", function(){
		var tracker = new Tracker({testMode:true, switch:"test"});
		var f = tracker.getAppDataRootFolder();
		var list = tracker.listProjects();
		for (var i = 0; i < list.length; i++) {
			var p = list[i];
			var dir = path.join(f, p);
			fse.removeSync(dir); //I just deleted my entire testing HOME directory.
		}
		tracker.listProjects().length.should.equal(0);
	});

})

describe("Time values", function(){
	it("should return the correct time", function(){
		var time = new TimeTrackTimeValue("00:00:09");
		time.toString().should.equal("00:00:09");
	});

	it("should throw exception when an invalid time value was passed", function(){
		(function() {
			/* jshint ignore:start */
			var time = new TimeTrackTimeValue("adsfasdf");
			/* jshint ignore:end */
		}).should.throw("invalid time value");
	});

});

describe("Date values", function(){
	it("should throw exception when an invalid date value was passed", function(){
		(function() {
			/* jshint ignore:start */
			var time = new TimeTrackDateValue("adsfasdf");
			/* jshint ignore:end */
		}).should.throw("invalid date value");
	});

	it("should return the correct date", function(){
		var date = new TimeTrackDateValue("01.09.1977");
		date.toString().should.equal("01.09.1977");
	});

	it("should return the correct short date", function(){
		var date = new TimeTrackDateValue("09.1977");
		date.year.should.equal("1977");
		date.month.should.equal("09");
	});
});

describe("inital usage", function(){
	var tracker;

	it("should throw exception when no active project was selected", function(){
		(function() {
			tracker = new Tracker({testMode:true});
		}).should.throw("So far you have no active project selected. Please create one with --switch");
	});

	it("should throw exception when no active project was selected when try to set availableseconds", function(){
		(function() {
			tracker = new Tracker({testMode:true, availableseconds:true});
			tracker.setAvailableWorkTime();
		}).should.throw("So far you have no active project selected. Please create one with --switch");
	});

	it("should throw exception when no active project was selected when try to set availableminutes", function(){
		(function() {
			tracker = new Tracker({testMode:true, availableminutes:true});
			tracker.setAvailableWorkTime();
		}).should.throw("So far you have no active project selected. Please create one with --switch");
	});

	it("should throw exception when no active project was selected when try to set availablehours", function(){
		(function() {
			tracker = new Tracker({testMode:true, availablehours:true});
			tracker.setAvailableWorkTime();
		}).should.throw("So far you have no active project selected. Please create one with --switch");
	});

	it("should throw exception when no active project was selected when try to set availabledays", function(){
		(function function_name() {
			tracker = new Tracker({testMode:true, availabledays:true});
			tracker.setAvailableWorkTime();
		}).should.throw("So far you have no active project selected. Please create one with --switch");
	});

	it("should throw exception when no project name was passed to --switch", function(){
		(function function_name() {
			tracker = new Tracker({testMode:true, switch:true});
			tracker.switchProject();
		}).should.throw("Please choose a project name");
	});

	it("should throw exception when invalid project name was passed to --switch", function(){
		(function function_name() {
			var projectName = "$%.??\\//";
			tracker = new Tracker({testMode:true, switch:projectName});
			tracker.switchProject(projectName);
		}).should.throw("invalid project name");
	});

});



describe("usage", function(){
	var tracker;
	var time = new Date(); 
	tk.freeze(time);

	it("should switch to project mocha-test", function(){
		tracker = new Tracker({testMode:true, switch:"mocha-test-2"});
		tracker.switchProject("mocha-test-2");
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.toggle();
		tracker = new Tracker({keepConfig:true, testMode:true, switch:projectName});
		tracker.switchProject(projectName);
		tracker.system.configuration.activeProjectName.should.equal(projectName);
	});

	it("should work on current project", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, info:true});
		tracker.system.configuration.activeProjectName.should.equal(projectName);
	});


	it("should toggle state ON 1", function(){
		time.setSeconds(time.getSeconds() + 30);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(1);
	});

	it("should toggle state OFF 1", function(){
		time.setSeconds(time.getSeconds() + 30);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(1);
	});

	it("should return a negative for available seconds per day", function(){
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.getAvailableSecondsPerDay().should.below(0);
	});

	it("should throw exception when no available seconds per day was set up", function(){
		tracker = new Tracker({keepConfig:true, testMode:true});
		(function() {
			tracker.program = {keepConfig:true, testMode:true, availableseconds:true};
			tracker.needAvailableWorkTimeSetup();
		}).should.throw("There was no available worktime setup. Please set some time using --availableseconds, availableminutes or --availablehours");
	});

	it("should throw exception when no value was passed to --availableseconds", function(){
		(function() {
			tracker.program = {keepConfig:true, testMode:true, availableseconds:true};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});

	it("should throw exception when no value was passed to --availableminutes", function(){
		(function() {
			tracker.program = {keepConfig:true, testMode:true, availableminutes:true};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});

	it("should throw exception when no value was passed to --availablehours", function(){
		(function() {
			tracker.program = {keepConfig:true, testMode:true, availablehours:true};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});

	it("should throw exception when no value was passed to --availabledays", function(){
		(function() {
			tracker.program = {keepConfig:true, testMode:true, availabledays:true};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});


	it("should throw exception when an invalid value was passed to --availabledays", function(){
		(function() {
			tracker.program = {keepConfig:true, testMode:true, availabledays:"&/("};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});

	it("should save when value was passed to --availableseconds", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, availableseconds:"1"});
		tracker.setAvailableWorkTime();
		tracker.config.availableWorktimeInSeconsThisMonth.should.equal(1);
	});

	it("should save when value was passed to --availableminutes", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, availableminutes:"1"});
		tracker.setAvailableWorkTime();
		tracker.config.availableWorktimeInSeconsThisMonth.should.equal(1 * 60);
	});

	it("should save when value was passed to --availablehours", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, availablehours:"1"});
		tracker.setAvailableWorkTime();
		tracker.config.availableWorktimeInSeconsThisMonth.should.equal(1 * 60 * 60);
	});

	it("should save when value was passed to --availabledays", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, availabledays:"1"});
		tracker.setAvailableWorkTime();
		tracker.config.availableWorktimeInSeconsThisMonth.should.equal(1 * 60 * 60 * 8);
	});




	it("should toggle state ON 2", function(){
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(2);
	});

	it("should toggle state OFF 2", function(){
		time.setSeconds(time.getSeconds() + 30);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(2);
	});


	it("should toggle state ON 3", function(){
		time.setSeconds(time.getSeconds() + 30);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(3);
	});

	it("should toggle state OFF 3", function(){
		time.setSeconds(time.getSeconds() + 30);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(3);
	});

	it("should list projects --list", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, list:true});
		var list = tracker.listProjects();
		list.length.should.above(1);
		list.indexOf(projectName).should.above(-1);
	});

});



describe("usage", function(){
	var time = new Date(); 
	var tracker;

	it("should work on current project", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, info:true});
		tracker.system.configuration.activeProjectName.should.equal(projectName);
	});


	it("should inform about the current day", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, info:true});
		var res = tracker.reportByDay();
		res.should.equal(90);
	});

	it("should inform about the day before", function(){
	 	var d = new Date();
 		d.setDate(d.getDate()-1);
		var date = new TimeTrackDateValue();
		date.setByJavascriptDate(d);
		tracker = new Tracker({keepConfig:true, testMode:true, info:date.toString()});
		var res = tracker.reportByDay(date.toString());
		res.should.equal(0);
	});

	it("should inform about a specified day", function(){
	 	var d = new Date();
 		d.setDate(d.getDate()+1); // +1 because time is freezed
		var date = new TimeTrackDateValue();
		date.setByJavascriptDate(d);
		tracker = new Tracker({keepConfig:true, testMode:true, info:date.toString()});
		var res = tracker.reportByDay(date.toString());
		res.should.equal(90);
	});

	it("should report current month as csv ", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, report:true});
		var res = tracker.report(true);
		res.should.equal(90);
	});

	it("should toggle state ON 4", function(){
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(4);
	});

	it("should toggle state OFF 4", function(){
		time.setSeconds(time.getSeconds() + 60 * 60 * 10);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(4);
	});


	it("should inform about a specified day when user is over the time", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, availabledays:1});
		tracker.setAvailableWorkTime();
		tracker = new Tracker({keepConfig:true, testMode:true, info:true});
		var res = tracker.reportByDay();
		res.should.equal(36090);
	});


});

describe("OS GUI", function(){
	var tracker;
	
	it("should openAppDataFolder", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, open:true});
		var res = tracker.openAppDataFolder();
		res.should.equal(true);
	});

	it("should openSystemDataFolder", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, opensystem:true});
		var res = tracker.openSystemDataFolder();
		res.should.equal(true);
	});

	it("should editAppDataJSON", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, edit:true});
		var res = tracker.editAppDataJSON();
		res.should.equal(true);
	});

	it("should editSystemDataJSON", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, editsystem:true});
		var res = tracker.editSystemDataJSON();
		res.should.equal(true);
	});
});


describe("report", function(){
	var tracker;
	
	it("should report a special day", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, report:true, timerange:"09.1977"});
		var res = tracker.report(true);
		res.should.equal(0);
	});

	it("should report today ", function(){
		var d = new TimeTrackDateValue();
		tracker = new Tracker({keepConfig:true, testMode:true, report:true, timerange:d.toString()});
		var res = tracker.report(true);
		res.should.equal(36090);
	});
});

