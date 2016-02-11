var fs = require("fs");
var path = require("path");
var colors = require("colors/safe");
var Moment = require("moment");
var fse = require("fs-extra");
var sanitize = require("sanitize-filename");



function pad(num, size) {
	var s = "00000000000000000000000000" + num;
	return s.substr(s.length-size);
}

var Tracker = function(program) {
	this.program = program;
	this.initSystemConfiguration();

	if (!program.switch){
		this.needActiveProject();
	}

	if (!program.switch){
		var today = new Date();
		this.appDataFolder = path.join(process.env.APPDATA || (process.platform === "darwin" ? process.env.HOME + "Library/Preferences" : "/var/local"), "time-track", this.system.configuration.activeProjectName);
		fse.ensureDirSync(this.appDataFolder);

		if ((program.validate && program.validate !== true) || (program.csv && program.csv !== true)){
			var dateArr;
			if (program.validate){
				dateArr = this.normalizeDateString(program.validate).split(".");
				this.configFile = path.join(this.appDataFolder, dateArr[2] + "-" + dateArr[1] + ".json");
			}
			if (program.csv){
				dateArr = program.csv.split(".");
				this.configFile = path.join(this.appDataFolder, dateArr[1] + "-" + pad(dateArr[0],2) + ".json");
			}
		} else {
			this.configFile = path.join(this.appDataFolder, today.getFullYear() + "-" + pad(today.getMonth()+1,2) + ".json");
		}

		if (fs.existsSync(this.configFile)){
			this.config = require(this.configFile);
		}

		this.todayDateString = pad(today.getDate(),2) + "." + pad(today.getMonth()+1,2) + "." + today.getFullYear();

		var seconds = today.getSeconds();
		var minutes = today.getMinutes();
		var hour = today.getHours();
		this.nowTimeString = pad(hour,2) + ":" + pad(minutes,2) + ":" + pad(seconds,2);


	}
	if (!this.config){
		this.config = {availableWorktimeInSeconsThisMonth:null};
	}

	return this;
};

Tracker.prototype.open = function(item) {
	require("open")(item);
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
	this.open(path.join(this.appDataFolder, ".."));
};

Tracker.prototype.openSystemDataFolder = function() {
	this.open(__dirname);
};

Tracker.prototype.editAppDataJSON = function() {
	this.open(this.configFile);
};

Tracker.prototype.editSystemDataJSON = function() {
	this.open(this.system.filename);
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

Tracker.prototype.logError = function() {
	if (!this.program.testMode){
		console.error.apply(console.log, arguments);
	}
};

Tracker.prototype.listProjects = function() {

	if (this.system.configuration.projects.length !== 0){
		for (var i = 0; i < this.system.configuration.projects.length; i++) {
			var project = this.system.configuration.projects[i];
			this.log(colors.cyan(project));
		}
	} else {
		this.logError(colors.red("So far you have no projects created. Please create one with --switch"));
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
	if (!this.config[this.todayDateString]) {
		this.config[this.todayDateString] = [];
	} else {
		timeSections = this.config[this.todayDateString];
	}

	var lastTimeSection = [];
	if (timeSections.length > 0){
		lastTimeSection = timeSections[timeSections.length-1];
	}

	if (lastTimeSection.length < 2){
		lastTimeSection.push(this.nowTimeString);
		if (this.config[this.todayDateString].length === 0){
			this.config[this.todayDateString].push(lastTimeSection);
			this.motivate();
		} else {
			this.config[this.todayDateString][timeSections.length-1] = lastTimeSection;
			this.log(colors.red("Stopped \"" + this.system.configuration.activeProjectName + "\". Have a great time DUDE!"));
		}
	} else {
		lastTimeSection = [this.nowTimeString];
		this.config[this.todayDateString].push(lastTimeSection);
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
			var end = new Moment(this.nowTimeString, "HH:mm:ss");
			if (section.length > 1){
				end = new Moment(section[1], "HH:mm:ss");
			}
			diff += end.diff(start);
			// this.log(section.length, this.nowTimeString, end.toString());
	}

	return diff/1000;
};


Tracker.prototype.sumMonth = function(month,year) {
	month = pad(month,2);
	var seconds = 0;
	for (var d = 1; d < 32; d++) {
		var key = pad(d,2) + "." + pad(month,2) + "." + year;
		if (this.config[key]){
			seconds += this.sum(key);
		}
	}
	return seconds;
};

Tracker.prototype.normalizeDateString = function(date, withoutDay) {
	var d = date.split(".");
	var result = pad(d[1],2) + "." + d[2];
	if (!withoutDay){
		result = pad(d[0],2) + "." + result;
	}
	return result;
};

Tracker.prototype.getWorkedDaysThisMonth = function(month, year) {
	var result = 0;
	for (var d = 1; d <= 31; d++) {
		var key = pad(d,2) + "." + pad(month,2) + "." + year;
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
		throw new Error("There was no available worktime setup found for project \"" + this.system.configuration.activeProjectName + "\" in " + this.configFile + ". Please set some time using --availableseconds, availableminutes or --availablehours");
	}
};


Tracker.prototype.reportByDay = function(date) {
	this.needAvailableWorkTimeSetup();
	if(!date){
		date = this.todayDateString;
	} else {
		date = this.normalizeDateString(date);
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
		var canWorkUntil = new Moment(date + " " + this.nowTimeString, "DD.MM.YYYY HH:mm:ss").add(restSecondsToWorkThisDay - result, "seconds");
		this.log(color("Time elapsed:"), color(date), color("-"), color(time.format("HH:mm:ss")), color("You should work until"), color(canWorkUntil.format("dddd, MMMM Do YYYY, h:mm:ss a")), color(":O)"));
	}
};

Tracker.prototype.reportAsCsv = function(date) {
	this.needAvailableWorkTimeSetup();
	if(!date){
		date = this.normalizeDateString(this.todayDateString, true);
	}
	var dateArr = date.split(".");
	var month = pad(dateArr[0],2);
	var year = dateArr[1];

	this.log("DocumentDate;WorkingDays;WorkedDays;WorkingHours;WorkedHours;;Date;StartTime;StopTime;Total");
	this.log(
			new Moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + ";" +
			this.getWorkingDaysThisMonth() + ";" +
			this.getWorkedDaysThisMonth(month, year) + ";"  +
			this.getWorkingSecondsThisMonth() / 60 / 60 + ";" +
			Math.round(this.sumMonth(month, year) / 60 / 60 * 100) / 100 + ";;;;;"
	);

	var logData = function(data, key) {
		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			var sum = "";
			if ( i === data.length-1 ){
				sum = this.sum(key);
				sum = new Moment("00:00:00", "HH:mm:ss").add(sum, "seconds").format("HH:mm:ss");
			}
			this.log(";;;;;;" + key + ";" + item[0] + ";" + (item[1] || (new Moment()).format("HH:mm:ss")) + ";" + sum);
		}
	};
	
	for (var d = 1; d < 32; d++) {
		var key = pad(d,2) + "." + month + "." + year;
		if (this.config[key]){
			var data = this.config[key];
			logData(data, key);
		}
	}
};

module.exports = Tracker;