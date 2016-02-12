var Moment = require("moment");

var TimeTrackTimeValue = function(value) {
	if (value){
		this.originalValue = value;
		this.init();
	} else {
		this.now();
	}

	return this;
};

TimeTrackTimeValue.prototype.init = function() {
	var valArr = this.originalValue.split(":");
	if (valArr.length !== 3){
		throw new Error("invalid time value");
	}
	this.moment = new Moment(this.originalValue, "HH:mm:ss");
};

TimeTrackTimeValue.prototype.now = function() {
	var today = new Date();
	var seconds = today.getSeconds();
	var minutes = today.getMinutes();
	var hour = today.getHours();
	this.originalValue = this.pad(hour) + ":" + this.pad(minutes) + ":" + this.pad(seconds);
	this.init();
	return this;
};

TimeTrackTimeValue.prototype.toString = function() {
	return this.moment.format("HH:mm:ss");
};


TimeTrackTimeValue.prototype.pad = function(num, size) {
	var s = "00000000000000000000000000" + num;
	return s.substr(s.length - (size || 2));
};

module.exports = TimeTrackTimeValue;