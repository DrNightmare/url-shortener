var express = require('express');
var validUrl = require('valid-url');
var tinyUrl = require('tinyurl');

var app = express();

app.get('/', function(req, res) {
	var inputUrl = req.query.url;
	var tUrl;
	if (validUrl.isUri(inputUrl)) {
		tinyUrl.shorten(inputUrl, function(small) {
			tUrl = small;
			console.log(tUrl);
			res.send({"original" : inputUrl, "tiny" : tUrl});
		});
	}
	else {
		console.log("invalid url");
		res.send({"error": "Invalid URL"});
	}
});

app.listen(process.env.PORT || 5000, function(err, data) {
	console.log("Listening at port 5000");
});