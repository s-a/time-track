var fs = require("fs");
var path = require("path");
var colors = require("colors/safe");
var moment = require("moment");


function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

var Tracker = function() {
	var today = new Date();

	this.appDataFolder = path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + 'Library/Preferences' : '/var/local'), "time-track");

	try{
	    stats = fs.lstatSync(this.appDataFolder);

	    if (stats.isDirectory()) {
	    }
		this.configFile = path.join(this.appDataFolder, today.getFullYear() + "-" + pad(today.getMonth()+1,2) + ".json");
		if (fs.existsSync(this.configFile)){
			this.config = require(this.configFile);
		} else {
			this.config = {};
		};

		this.setupFile = path.join(this.appDataFolder, ".config.js");
		if (fs.existsSync(this.setupFile)){
			this.config.setup = require(this.setupFile);
		} else {
			this.config.setup = {availablePerMonth:[]}
		}

		this.todayDateString = pad(today.getDate(),2) + "." + pad(today.getMonth()+1,2) + "." + today.getFullYear();

		var seconds = today.getSeconds();
		var minutes = today.getMinutes();
		var hour = today.getHours();
		this.nowTimeString = pad(hour,2) + ":" + pad(minutes,2) + ":" + pad(seconds,2);

		console.log(colors.cyan("timeTrack:"), colors.cyan(this.configFile), colors.cyan(this.setupFile));
	} catch(e){
        console.error(colors.red(this.appDataFolder , "does not exist. Please create it."));
	}

	return this;
};


Tracker.prototype.motivate = function() {
	var quotes = require("./quotes.js");
	var quote = quotes[Math.floor(Math.random()*quotes.length)];
	console.log(
		colors.green("OK. lets code awesome things!"),
		colors.yellow(quote.text), "~" + colors.yellow(quote.author) 
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
			console.log(colors.red("Stopped. Have a great time DUDE!"));
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
			var start = new moment(section[0], 'HH:mm:ss');
			var end = new moment(this.nowTimeString, 'HH:mm:ss');
			if (section.length > 1){
				end = new moment(section[1], 'HH:mm:ss');
			}
			diff += end.diff(start);
			// console.log(section.length, this.nowTimeString, end.toString());
	}

	return diff/1000;
}


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

Tracker.prototype.normalizeDateString = function(date) {
	var d = date.split(".");
	d = pad(d[0],2) + "." + pad(d[1],2) + "." + d[2];
	return d;
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

Tracker.prototype.getWorkingDaysThisMonth = function(month, year) {
	var result = 0;
	var key = pad(month,2) + "." + year;

	if (this.config.setup.availablePerMonth[key]){
		result = this.config.setup.availablePerMonth[key] / 8 / 60 / 60;
	}
	return result;
};

Tracker.prototype.getAvailableSecondsPerDay = function(month, year) {
	var key = pad(month,2) + "." + year;
	var availableSecondsPerMonth = 0;
	if (this.config.setup.availablePerMonth[key]){
		availableSecondsPerMonth = this.config.setup.availablePerMonth[key];
	};
	return (availableSecondsPerMonth - this.sumMonth(month,year)) / (this.getWorkingDaysThisMonth(month,year) - this.getWorkedDaysThisMonth(month, year));
};


Tracker.prototype.reportByDay = function(date) {
	if(!date){
		date = this.todayDateString;
	} else {
		date = this.normalizeDateString(date);
	}

	var result = this.sum(date);
	var restSecondsToWorkThisDay = this.getAvailableSecondsPerDay(date.split(".")[1],date.split(".")[2]);

	var time = new moment("00:00:00", 'HH:mm:ss').add(result, 'seconds');
	var color = colors.green;
	if (result >= restSecondsToWorkThisDay){
		color = colors.cyan;
		console.log(color("Time elapsed:"), color(date), color(" - "), color(time.format("HH:mm:ss")), color("You are done for this day ;O)"));
	} else {
		var canWorkUntil = new moment(date + " " + this.nowTimeString, 'DD.MM.YYYY HH:mm:ss').add(restSecondsToWorkThisDay - result, 'seconds');
		console.log(color("Time elapsed:"), color(date), color(" - "), color(time.format("HH:mm:ss")), color("Awesome. This day you should work until"), color(canWorkUntil.format("dddd, MMMM Do YYYY, h:mm:ss a")), color(":O)"));
	}
};

Tracker.prototype.reportByMonth = function(date) {
	var dateArr = this.todayDateString.split(".");
	console.log(dateArr);
	this.sumMonth(dateArr[2], dateArr[1]);
};

module.exports = Tracker;