"use strict";

var path = require('path');
var fs = require("fs");
var Map = require('es6-map');
var Promise = require('es6-promise').Promise;
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var compression = require('compression');

var PORT = 9100;

// Load static files
app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname,'views', 'index.html'));
});

app.use("/helpers/polyfills", require('express').static(__dirname + '/helpers/polyfills'));

app.get('/app.js', function(req, res){
	res.sendFile(path.join(__dirname, 'app.js'));
});

var server = http.createServer(app);

// Start server
server.listen(PORT, function () {
    console.log("Server running on http://localhost:%d in %s mode", PORT, app.settings.env);
});


