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

// arguments
var mode = process.argv[2] || "dev";
var config = require(path.join("..", "config", mode+".json")); // will throw if file not found

console.log('starting in mode', mode);

var PORT = config.port || 80;
var HOST = config.host;
if(!HOST)
    throw 'missing host in config';


var server;
if(config.https){
    var options = {
        key: fs.readFileSync(config.keypath),
        cert: fs.readFileSync(config.certpath)
    };
    
    server = https.createServer(options, app);
}
else{
    server = http.createServer(app);
}