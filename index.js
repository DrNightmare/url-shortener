var alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
var base = alphabet.length;

// function to convert integer to base string
function encode(num){
	var encoded = '';
	while(num) {
		var r = num % base;
		num = Math.floor(num / base);
		encoded = alphabet[r].toString() + encoded;
	}
	return encoded;
}

function decode(str) {
	var decoded = 0;
	while(str) {
		var index = alphabet.indexOf(str[0]);
		var power = str.length - 1;
		decoded += index * (Math.pow(base, power));
		str = str.substring(1);
	}
	return decoded;
}

var express = require('express');
var validUrl = require('valid-url');
var path = require('path');
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;
var url = process.env.MONGOLAB_URI;

var app = express();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/new/', function(req, res) {
	var inputUrl = req.query.url;
	if (validUrl.isUri(inputUrl)) {
		MongoClient.connect(url, function(err, db){
			if (err) {
				console.log(err);
				res.send({"error" : "Error occurred"});
				db.close();
			}
			else {
				console.log("Connection established");
				testCollection = db.collection('testCollection');

				// check if inputUrl already in collection
				// if so, just show that link
				testCollection.findOne({inputUrl : inputUrl}, function(err, result){
					if (err) console.log(err);
					if (result) {
						// already exists
						res.send({inputUrl : inputUrl, "shortUrl" : "https://urli.herokuapp.com/" + result.shortUrl});
						db.close();
					}
					else {
						// does not exist already
						testCollection.count({}, function(err, numOfDocs){
							// generate short url here
							var shortUrl = encode(numOfDocs + 10);
							testCollection.insertOne({inputUrl : inputUrl, shortUrl: shortUrl});
							res.send({inputUrl : inputUrl, "shortUrl" : "https://urli.herokuapp.com/" + shortUrl});
							db.close();
						});
					}
				});
			}
		});
	}
	else {
		console.log("invalid url");
		res.send({"error": "Invalid URL"});
	}
});

app.get('/:shortUrl', function(req, res) {
	// check if short url in db
	var shortUrl = req.params.shortUrl;
	MongoClient.connect(url, function(err, db){
			if (err) {
				console.log(err);
				res.send({"error" : "Error occurred"});
				db.close();
			}
			else {
				testCollection = db.collection('testCollection');
				// check if inputUrl already in collection
				// if so, just show that link
				testCollection.findOne({shortUrl : shortUrl}, function(err, result){
					if (err) console.log(err);
					if (result) {
						// already exists
						res.redirect(result.inputUrl);
						db.close();
					}
					else {
						// does not exist already
						res.send({"error" : "Short URL does not exist"});
					}
				});
			}
		});
});

app.listen(process.env.PORT || 5000, function(err, data) {
	console.log("Listening at port 5000");
});