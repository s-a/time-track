/* jshint ignore:start */
// Code here will be ignored by JSHint.
var should = require("should");
/* jshint ignore:end */
var projectName = "mocha-test";


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
		tracker.system.configuration.projects.length.should.equal(1);
		tracker.system.configuration.projects[0].should.equal(projectName);
	});

});
