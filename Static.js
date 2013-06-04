var express = require("express");
var fs = require('fs');
var sys = require('sys');

var app = express();
    app.use(express.logger());
    app.set("view options", {layout: false});
    app.use(express.static(__dirname + '/public/Static/'));

app.get('/', function(req, res){
    res.render('index.html');
});

app.listen(8080);
console.log('Express server started');