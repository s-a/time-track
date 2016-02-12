/* jshint ignore:start */
// Code here will be ignored by JSHint.
var should = require("should");
/* jshint ignore:end */
var projectName = "mocha-test";
var tk = require('timekeeper');

var Tracker;
try {
	Tracker = require("./../lib-cov/index.js");
} catch(e){
	Tracker = require("./../lib/index.js");
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

	it("should switch to project mocha-test", function(){
		tracker = new Tracker({testMode:true, switch:projectName});
		tracker.switchProject(projectName);
		tracker.system.configuration.activeProjectName.should.equal(projectName);
	});


	it("should throw exception when no value was passed to --availableseconds", function(){
		(function() {
			tracker.program = {testMode:true, availableseconds:true};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});

	it("should throw exception when no value was passed to --availableminutes", function(){
		(function() {
			tracker.program = {testMode:true, availableminutes:true};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});

	it("should throw exception when no value was passed to --availablehours", function(){
		(function() {
			tracker.program = {testMode:true, availablehours:true};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});

	it("should throw exception when no value was passed to --availabledays", function(){
		(function() {
			tracker.program = {testMode:true, availabledays:true};
			tracker.setAvailableWorkTime();
		}).should.throw("Please pass a value");
	});


	it("should throw exception when an invalid value was passed to --availabledays", function(){
		(function() {
			tracker.program = {testMode:true, availabledays:"&/("};
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

	it("should list projects --list", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, list:true});
		tracker.listProjects();
		tracker.system.configuration.projects.length.should.equal(1);
		tracker.system.configuration.projects[0].should.equal(projectName);
	});


	var time = new Date(); 
	tk.freeze(time);

	it("should toggle state ON", function(){
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(1);
	});

	it("should toggle state OFF", function(){
		time.setSeconds(time.getSeconds() + 30);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(1);
	});


	it("should toggle state ON", function(){
		time.setSeconds(time.getSeconds() + 30);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(2);
	});

	it("should toggle state OFF", function(){
		time.setSeconds(time.getSeconds() + 30);
		tk.travel(time); // Travel to that date.
		tracker = new Tracker({keepConfig:true, testMode:true});
		tracker.toggle();
		tracker.config[tracker.date.toString()].length.should.equal(2);
	});
});



describe("usage", function(){
	var tracker;

	it("should validate current day", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, validate:true});
		var res = tracker.reportByDay();
		res.should.equal(60);
	});

	it("should report current month as csv ", function(){
		tracker = new Tracker({keepConfig:true, testMode:true, report:true});
		var res = tracker.report(true);
		res.should.equal(60);
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
