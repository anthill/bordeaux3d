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
console.log(PORT);
// var HOST = config.host;
// if(!HOST)
//     throw 'missing host in config';

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.use("/polyfills", require('express').static(__dirname + '/polyfills'));

app.get('/app.js', function(req, res){
	res.sendFile(path.join(__dirname, 'app.js'));
});

var server = http.createServer(app);

server.listen(PORT, function () {
    console.log('Server running on', [
        'http://',
        PORT
    ].join(''));
});
