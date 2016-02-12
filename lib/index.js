var fs = require("fs");
var path = require("path");
var colors = require("colors/safe");
var Moment = require("moment");
var fse = require("fs-extra");
var sanitize = require("sanitize-filename");
var TimeTrackDateValue = require("./time-track-date-value.js");
var TimeTrackTimeValue = require("./time-track-time-value.js");


var Tracker = function(program) {
	this.DateValue = TimeTrackDateValue;
	this.Moment = Moment;
	this.program = program;
	this.initSystemConfiguration();
	this.time = new TimeTrackTimeValue();

	if (!program.switch && !program.list){
		this.needActiveProject();
	}

	if (!program.switch){

		this.date = new TimeTrackDateValue();

		this.appDataFolder = path.join(process.env.APPDATA || (process.platform === "darwin" ? process.env.HOME + "Library/Preferences" : "/var/local"), "time-track", this.system.configuration.activeProjectName || "default");
		if (program.testMode){
			this.appDataFolder = path.join(__dirname, "time-track", this.system.configuration.activeProjectName);
		}
		fse.ensureDirSync(this.appDataFolder);

		if ((program.info && program.info !== true) || (program.report && program.report !== true)){
			var d;
			if (program.info){
				d = new TimeTrackDateValue(program.info);
				this.configFile = path.join(this.appDataFolder, d.year + "-" + d.month + ".json");
			}
			if (program.report){
				d = new TimeTrackDateValue(program.report);
				this.configFile = path.join(this.appDataFolder, d.year + "-" + d.month + ".json");
			}
		} else {
			this.configFile = path.join(this.appDataFolder, this.date.year + "-" + this.date.month + ".json");
		}

		if (fs.existsSync(this.configFile)){
			this.config = require(this.configFile);
		}

		// this.nowTimeString = this.date.pad(hour) + ":" + this.date.pad(minutes) + ":" + this.date.pad(seconds);

	}
	if (!this.config){
		this.config = {availableWorktimeInSeconsThisMonth:null};
	}

	return this;
};

Tracker.prototype.open = function(item) {
	if (!this.program.testMode){
		require("open")(item);
	}
	return true;
};

Tracker.prototype.needActiveProject = function() {
	if (!this.system.configuration.activeProjectName){
		throw new Error("So far you have no active project selected. Please create one with --switch");
	}
};

Tracker.prototype.setAvailableWorkTime = function() {
	this.needActiveProject();

	if (this.program.availableseconds){
		if(this.program.availableseconds === true){
			throw new Error("Please pass a value");
		}
		this.config.availableWorktimeInSeconsThisMonth = parseInt(this.program.availableseconds, 10);
	}
	if (this.program.availableminutes){
		if(this.program.availableminutes === true){
			throw new Error("Please pass a value");
		}
		this.config.availableWorktimeInSeconsThisMonth = parseInt(this.program.availableminutes, 10) * 60;
	}
	if (this.program.availablehours){
		if(this.program.availablehours === true){
			throw new Error("Please pass a value");
		}
		this.config.availableWorktimeInSeconsThisMonth = parseInt(this.program.availablehours, 10) * 60 * 60;
	}
	if (this.program.availabledays){
		if(this.program.availabledays === true){
			throw new Error("Please pass a value");
		}
		this.config.availableWorktimeInSeconsThisMonth = parseInt(this.program.availabledays, 10) * 8 * 60 * 60;
	}
	if (parseFloat(this.config.availableWorktimeInSeconsThisMonth)+"" === "NaN"){
		throw new Error("Please pass a value");
	}

	this.save();
};

Tracker.prototype.openAppDataFolder = function() {
	return this.open(path.join(this.appDataFolder, ".."));
};

Tracker.prototype.openSystemDataFolder = function() {
	return this.open(__dirname);
};

Tracker.prototype.editAppDataJSON = function() {
	return this.open(this.configFile);
};

Tracker.prototype.editSystemDataJSON = function() {
	return this.open(this.system.filename);
};

Tracker.prototype.initSystemConfiguration = function() {
	var configFilename = path.join(__dirname, ".configuration.json");
	if (this.program.testMode){
		configFilename = path.join(__dirname, ".test.configuration.json");
		if (!this.program.keepConfig && fs.existsSync(configFilename)){
			fse.removeSync(configFilename); // be shure we are at initial usage when testing.
		}
	}
	var config = {projects:[]};
	if (fs.existsSync(configFilename)){
		config = require(configFilename);
	}
	this.system = {
		filename: configFilename,
		configuration: config
	};
};

Tracker.prototype.saveSystemConfiguration = function() {
	fs.writeFileSync(this.system.filename, JSON.stringify(this.system.configuration, null, 4));
};

Tracker.prototype.log = function() {
	if (!this.program.testMode){
		console.log.apply(console.log, arguments);
	}
};

Tracker.prototype.listProjects = function() {
	var getDirectories = function (srcpath) {
	  return fs.readdirSync(srcpath).filter(function(file) {
	    return fs.statSync(path.join(srcpath, file)).isDirectory();
	  });
	};
	var d = path.join(process.env.APPDATA || (process.platform === "darwin" ? process.env.HOME + "Library/Preferences" : "/var/local"), "time-track");
	var dirs = getDirectories(d);
	for (var i = 0; i < dirs.length; i++) {
		var project = dirs[i];
		if (project === this.system.configuration.activeProjectName){
			this.log(colors.yellow("* " + project));
		} else {
			this.log(colors.cyan(project));
		}
	}

};

Tracker.prototype.switchProject = function(projectName) {
	if (this.program.switch === true){
		throw new Error("Please choose a project name");
	}

	if( sanitize(projectName) !== projectName){
		throw new Error("invalid project name");
	}

	this.system.configuration.activeProjectName = projectName;
	if (this.system.configuration.projects.indexOf(projectName) === -1){
		this.system.configuration.projects.push(projectName);
	}
	this.saveSystemConfiguration();
	this.log(colors.green("Switched to " + projectName));
};

Tracker.prototype.motivate = function() {
	var quotes = require("./quotes.js");
	var quote = quotes[Math.floor(Math.random()*quotes.length)];
	this.log(
		colors.green("OK. lets do awesome things on \"" + this.system.configuration.activeProjectName + "\""),
		colors.yellow(quote.text), colors.green("~") + colors.yellow(quote.author)
	);
};

Tracker.prototype.toggle = function() {
	var timeSections = [];
	if (!this.config[this.date.toString()]) {
		this.config[this.date.toString()] = [];
	} else {
		timeSections = this.config[this.date.toString()];
	}

	var lastTimeSection = [];
	if (timeSections.length > 0){
		lastTimeSection = timeSections[timeSections.length-1];
	}

	if (lastTimeSection.length < 2){
		lastTimeSection.push(this.time.toString());
		if (this.config[this.date.toString()].length === 0){
			this.config[this.date.toString()].push(lastTimeSection);
			this.motivate();
		} else {
			this.config[this.date.toString()][timeSections.length-1] = lastTimeSection;
			this.log(colors.red("Stopped \"" + this.system.configuration.activeProjectName + "\". Have a great time DUDE!"));
		}
	} else {
		lastTimeSection = [this.time.toString()];
		this.config[this.date.toString()].push(lastTimeSection);
		this.motivate();
	}
};

Tracker.prototype.save = function() {
	fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 4));
};

Tracker.prototype.sum = function(date) {
	var timeSections = [];
	if (this.config[date]) {
		timeSections = this.config[date];
	}

	var diff = 0;
	for (var i = 0; i < timeSections.length; i++) {
		var section = timeSections[i];
			var start = new Moment(section[0], "HH:mm:ss");
			var end = new Moment(this.time.toString(), "HH:mm:ss");
			if (section.length > 1){
				end = new Moment(section[1], "HH:mm:ss");
			}
			diff += end.diff(start);
	}

	return diff/1000;
};


Tracker.prototype.sumMonth = function(month,year) {
	var result = 0;
	for (var d = 1; d < 32; d++) {
		var key = new TimeTrackDateValue(d+"."+month+"."+year).toString();
		if (this.config[key]){
			result += this.sum(key);
		}
	}
	return result;
};

/*
Tracker.prototype.normalizeDateString = function(date, withoutDay) {
	console.log("Tracker.prototype.normalizeDateString", colors.yellow("is obsolete"));
	var d = date.split(".");
	var result = pad(d[1],2) + "." + d[2];
	if (!withoutDay){
		result = pad(d[0],2) + "." + result;
	}
	return result;
};
*/
Tracker.prototype.getWorkedDaysThisMonth = function(month, year) {
	var result = 0;
	for (var d = 1; d <= 31; d++) {
		var key = new TimeTrackDateValue(d + "." + month + "." + year).toString();
		if (this.config[key]){
			result++;
		}
	}
	return result;
};

Tracker.prototype.getWorkingDaysThisMonth = function() {
	var result = 0;
	if (this.config.availableWorktimeInSeconsThisMonth){
		result = this.config.availableWorktimeInSeconsThisMonth / 8 / 60 / 60;
	}
	return result;
};

Tracker.prototype.getWorkingSecondsThisMonth = function() {
	var result = 0;
	if (this.config.availableWorktimeInSeconsThisMonth){
		result = this.config.availableWorktimeInSeconsThisMonth;
	}
	return result;
};

Tracker.prototype.getAvailableSecondsPerDay = function(month, year) {
	var availableSecondsPerMonth = 0;
	if (this.config.availableWorktimeInSeconsThisMonth){
		availableSecondsPerMonth = this.config.availableWorktimeInSeconsThisMonth;
	}
	return (availableSecondsPerMonth - this.sumMonth(month,year)) / (this.getWorkingDaysThisMonth() - this.getWorkedDaysThisMonth(month, year));
};

Tracker.prototype.needAvailableWorkTimeSetup = function() {
	if(!this.config.availableWorktimeInSeconsThisMonth){
		throw new Error("There was no available worktime setup. Please set some time using --availableseconds, availableminutes or --availablehours");
	}
};


Tracker.prototype.reportByDay = function(date) {
	this.needAvailableWorkTimeSetup();
	if(!date){
		date = this.date.toString();
	} else {
		date = new TimeTrackDateValue(date).toString();
	}

	this.log(colors.cyan("Project \"" + this.system.configuration.activeProjectName + "\"") , ("(" + this.configFile + ")"));


	var result = this.sum(date);
	var restSecondsToWorkThisDay = this.getAvailableSecondsPerDay(date.split(".")[1],date.split(".")[2]);

	var time = new Moment("00:00:00", "HH:mm:ss").add(result, "seconds");
	var color = colors.green;
	if (result >= restSecondsToWorkThisDay){
		color = colors.cyan;
		this.log(color("Time elapsed:"), color(date), color("-"), color(time.format("HH:mm:ss")), color("You are done for this day ;O)"));
	} else {
		var canWorkUntil = new Moment(date + " " + this.time.toString(), "DD.MM.YYYY HH:mm:ss").add(restSecondsToWorkThisDay - result, "seconds");
		this.log(color("Time elapsed:"), color(date), color("-"), color(time.format("HH:mm:ss")), color("You should work until"), color(canWorkUntil.format("dddd, MMMM Do YYYY, h:mm:ss a")), color(":O)"));
	}

	return result;
};


Tracker.prototype.report = function(reporter) {
	if (reporter === true){
		reporter = "./default-reporter.js";
	}
	var Report = require(reporter);
	var rpt = new Report(this);
	return rpt.compute();
};

module.exports = Tracker;