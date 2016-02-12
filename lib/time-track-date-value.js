var TimeTrackDateValue = function(value) {
	if (value){
		this.originalValue = value;
		this.init();
	} else {
		this.now();
	}

	return this;
};

TimeTrackDateValue.prototype.init = function() {
	var valArr = this.originalValue.split(".");
	if (valArr.length !== 2 && valArr.length !== 3){
		throw new Error("invalid date value");
	}

	if (valArr.length === 2){
		this.year = valArr[1];
		this.month = this.pad(valArr[0]);
		this.day = null;
	}

	if (valArr.length === 3){
		this.year = valArr[2];
		this.month = this.pad(valArr[1]);
		this.day = this.pad(valArr[0]);
	}
};

TimeTrackDateValue.prototype.now = function() {
	var now = new Date();
	this.originalValue =  this.pad(now.getDate()) + "." + this.pad(now.getMonth()+1) + "." + now.getFullYear();
	this.init();
	return this;
};

TimeTrackDateValue.prototype.toString = function() {
	var result = [];
	if (this.day){
		result.push(this.pad(this.day));
	}

	result.push(this.pad(this.month));
	result.push(this.year);

	return result.join(".");
};

TimeTrackDateValue.prototype.pad = function(num, size) {
	var s = "00000000000000000000000000" + num;
	return s.substr(s.length - (size || 2));
};


module.exports = TimeTrackDateValue;