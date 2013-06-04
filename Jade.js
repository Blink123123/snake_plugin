/*
 * Module dependencies
 */
var express = require('express')
  , stylus = require('stylus')

var app = express()
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
}
app.set('views', __dirname + '/views/')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public/Jade/'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public/Jade/'))

app.get('/', function (req, res) {
  res.render('index',
  { title : 'Home' 
  	, text: " Welcome To THQ! The Number One Gaming Company In The World!"
  	, images:[
  		"a","b","c"
  		]
	}
  )
})
app.listen(8080)