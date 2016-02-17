var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var colors = require("colors/safe");
var Moment = require("moment");
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

		this.appDataFolder = path.join(this.getAppDataRootFolder(), this.system.configuration.activeProjectName || "default");
		fse.ensureDirSync(this.appDataFolder);

		if ((program.info && program.info !== true) || (program.report && program.report !== true)){
			var d;
			if (program.info){
				d = new TimeTrackDateValue(program.info);
				this.configFile = path.join(this.appDataFolder, d.year + "-" + d.month + ".json");
				this.date = new TimeTrackDateValue(program.info);
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

Tracker.prototype.openConfiguration = function(date) {
	this.date = date;
	this.configFile = path.join(this.appDataFolder, this.date.year + "-" + this.date.month + ".json");
	if (fs.existsSync(this.configFile)){
		this.config = require(this.configFile);
	} else {
		this.config = {availableWorktimeInSeconsThisMonth:null};
	}
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
	return this.open(this.getAppDataRootFolder());
};

Tracker.prototype.editAppDataJSON = function() {
	return this.open(this.configFile);
};

Tracker.prototype.editSystemDataJSON = function() {
	return this.open(this.system.filename);
};

Tracker.prototype.initSystemConfiguration = function() {
	var configFilename = path.join(this.getAppDataRootFolder(), ".configuration.json");
	if (this.program.testMode){
		configFilename = path.join(__dirname, ".test.configuration.json");
		if (!this.program.keepConfig && fs.existsSync(configFilename)){
			fse.removeSync(configFilename); // be shure we are at initial usage when testing.
		}
	}
	var config = {};
	if (fs.existsSync(configFilename)){
		config = require(configFilename);
	}
	this.system = {
		filename: configFilename,
		configuration: config
	};
};

Tracker.prototype.saveSystemConfiguration = function() {
	fse.ensureDirSync(path.dirname(this.system.filename));
	fs.writeFileSync(this.system.filename, JSON.stringify(this.system.configuration, null, 4));
};

Tracker.prototype.log = function() {
	if (!this.program.testMode){
		console.log.apply(console.log, arguments);
	}
};

Tracker.prototype.getAppDataRootFolder = function() {
	var result = path.join(process.env.APPDATA || (process.platform === "darwin" ? path.join(process.env.HOME, "Library/Preferences") : "/var/local"), "time-track");
	if (this.program.testMode){
		result = path.join(__dirname, "time-track");
	}
	return result;
};

Tracker.prototype.listProjects = function() {
	var result = [];
	var getDirectories = function (srcpath) {
		return fs.readdirSync(srcpath).filter(function(file) {
			return fs.statSync(path.join(srcpath, file)).isDirectory();
		});
	};
	var d = this.getAppDataRootFolder();
	if (fs.existsSync(d)){
		var dirs = getDirectories(d);
		for (var i = 0; i < dirs.length; i++) {
			var project = dirs[i];
			if (project === this.system.configuration.activeProjectName){
				this.log(colors.yellow("* " + project));
			} else {
				this.log(colors.cyan(project));
			}
			result.push(project);
		}
	}
	return result;
};

Tracker.prototype.switchProject = function(projectName) {
	if (this.program.switch === true){
		throw new Error("Please choose a project name");
	}

	if( sanitize(projectName) !== projectName){
		throw new Error("invalid project name");
	}

	this.system.configuration.activeProjectName = projectName;
	this.saveSystemConfiguration();
	this.log(colors.green("Switched to project " + projectName));
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
	this.save();
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
	var result = (availableSecondsPerMonth - this.sumMonth(month,year)) / (this.getWorkingDaysThisMonth() - this.getWorkedDaysThisMonth(month, year));
	if (this.config.availableWorktimeInSeconsThisMonth === null){
		result = result * -1;
	}

	if (parseFloat(result)+"" === "NaN"){
		result = -1;
	}
	return result;
};

Tracker.prototype.needAvailableWorkTimeSetup = function() {
	if(!this.config.availableWorktimeInSeconsThisMonth){
		throw new Error("There was no available worktime setup. Please set some time using --availableseconds, availableminutes or --availablehours");
	}
};


Tracker.prototype.reportByDay = function(date) {

	if(date){
		this.date = new TimeTrackDateValue(date).toString();
	}

	if (!this.program.report || this.program.report === true){
		this.program.report = path.join(__dirname, "default-reporter.js");
	}

	var Report = require(this.program.report);
	var rpt = new Report(this);
	return rpt.computeToday();
};


Tracker.prototype.report = function(reporter) {
	if (reporter === true){
		reporter = path.join(__dirname, "default-reporter.js");
	}
	var Report = require(reporter);
	var rpt = new Report(this);
	return rpt.compute();
};

module.exports = Tracker;