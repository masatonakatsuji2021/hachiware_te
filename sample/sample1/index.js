const hachiware_te = require("hachiware_te");

var hte = new hachiware_te({
	path: __dirname + "/hte",
	errorDebug: true,
	load: "main.hte",
});

console.log(hte.out());