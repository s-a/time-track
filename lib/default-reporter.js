var TimeTrackDateValue = require("./time-track-date-value.js");
var colors = require("colors/safe");

var Reporter = function(timeTracker) {
	this.timeTracker = timeTracker;
	return this;
};


Reporter.prototype.computeToday = function() {

	var tt = this.timeTracker;
	var date = tt.date.toString();

	tt.log(colors.bold.cyan("Project \"" + tt.system.configuration.activeProjectName + "\"") , colors.yellow.underline("(" + tt.configFile + ")"));


	var result = tt.sum(date);
	var restSecondsToWorkThisDay = tt.getAvailableSecondsPerDay(date.split(".")[1],date.split(".")[2]);



	var time = new tt.Moment("00:00:00", "HH:mm:ss").add(result, "seconds");
	var color = colors.green;

	if (result >= restSecondsToWorkThisDay){
		color = colors.cyan;
		if (restSecondsToWorkThisDay > 0 && result > 0){
			tt.log(color("Time elapsed:"), color(date), color("-"), color(time.format("HH:mm:ss")), color("You are done for this day ;O)"));
		} else {
			tt.log(color("Time elapsed:"), color(date), color("-"), color(time.format("HH:mm:ss")));
		}
	} else {
		var canWorkUntil = new tt.Moment(date + " " + tt.time.toString(), "DD.MM.YYYY HH:mm:ss").add(restSecondsToWorkThisDay - result, "seconds");
		tt.log(colors.bold.yellow("Elapsed time on " + date + ": ") + colors.cyan(time.format("HH:mm:ss")));
		tt.log(colors.bold.yellow("Expected end-time:          ") + colors.cyan(canWorkUntil.format("dddd, MMMM Do YYYY, HH:mm:ss")));
	}


	return result;
};

Reporter.prototype.compute = function() {
	var tt = this.timeTracker;
	if(tt.program.timerange && tt.program.timerange !== true){
		tt.openConfiguration(new TimeTrackDateValue(tt.program.timerange));
	}
	var date = tt.date;

	tt.log("DocumentDate;WorkingDays;WorkedDays;WorkingHours;WorkedHours;;Date;StartTime;StopTime;Total");
	tt.log(
			new tt.Moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + ";" +
			tt.getWorkingDaysThisMonth() + ";" +
			tt.getWorkedDaysThisMonth(date.month, date.year) + ";"  +
			tt.getWorkingSecondsThisMonth() / 60 / 60 + ";" +
			Math.round(tt.sumMonth(date.month, date.year) / 60 / 60 * 100) / 100 + ";;;;;"
	);

	var result = 0;
	var self = this;
	var logData = function(data, key) {
		for (var i = 0; i < data.length; i++) {
			var item = data[i];
			var sum = "";
			if ( i === data.length-1 ){
				sum = self.timeTracker.sum(key);
				result += sum;
				sum = new self.timeTracker.Moment("00:00:00", "HH:mm:ss").add(sum, "seconds").format("HH:mm:ss");
			}
			self.timeTracker.log(";;;;;;" + key + ";" + item[0] + ";" + (item[1] || (new self.timeTracker.Moment()).format("HH:mm:ss")) + ";" + sum);
		}
	};

	for (var d = 1; d < 32; d++) {
		var key = new TimeTrackDateValue(d + "." + date.month + "." + date.year).toString();
		if (tt.config[key]){
			var data = tt.config[key];
			logData(data, key);
		}
	}

	return result;

};

module.exports = Reporter;