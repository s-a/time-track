var Reporter = function(timeTracker) {
	this.timeTracker = timeTracker;
	return this;
};

function pad(num, size) {
	var s = "00000000000000000000000000" + num;
	return s.substr(s.length-size);
}

Reporter.prototype.compute = function() {
 
	var date = this.timeTracker.normalizeDateString(this.timeTracker.todayDateString, true);
	 
	var dateArr = date.split(".");
	var month = pad(dateArr[0],2);
	var year = dateArr[1];

	this.timeTracker.log("DocumentDate;WorkingDays;WorkedDays;WorkingHours;WorkedHours;;Date;StartTime;StopTime;Total");
	this.timeTracker.log(
			new this.timeTracker.Moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + ";" +
			this.timeTracker.getWorkingDaysThisMonth() + ";" +
			this.timeTracker.getWorkedDaysThisMonth(month, year) + ";"  +
			this.timeTracker.getWorkingSecondsThisMonth() / 60 / 60 + ";" +
			Math.round(this.timeTracker.sumMonth(month, year) / 60 / 60 * 100) / 100 + ";;;;;"
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
		var key = pad(d,2) + "." + month + "." + year;
		if (this.timeTracker.config[key]){
			var data = this.timeTracker.config[key];
			logData(data, key);
		}
	}

	return result;

};

module.exports = Reporter;