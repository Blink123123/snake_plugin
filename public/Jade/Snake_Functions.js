(function($) {

	var directions = {left: 'l', right: 'r', up: 'u', down: 'd'}

	var settings

	$.fn.loadsnake = function (options) {
		
		var eventobject = 0

		settings = $.extend({}, {
				spawnlocation: {x: 0.5, y: 0.5}
				,minspeed: 100		
				,maxspeed: 50
				,scale: 10
				,spawnlength: 12
				,loadcombo: [0, directions.up, 0, 0, directions.left, 0, 0, directions.down, 0, 0,directions.right, 0]
				,mainbackcolor: "rgba(255,255,255,0.75)"
				,eventcolor: function(element){
					var colors = ["rgba(0, 0, 0, 0.75)", "rgba(155, 155, 155, 0.75)"]					
					var tester = false
					$(colors).each(function (index) {
						if ($(element).css("background-color").substring(1,17) == colors[index].substring(1,17) && index < colors.length - 1) {
							$(element).css("background-color", colors[index + 1])
							tester = true
						}
					})
					if (!tester)
						$(element).css("background-color", colors[0])
					eventobject ++
					if (eventobject == 10) {
						eventobject = 0
						reinitiate(element)
					}
				}
				,headcolor: "black"
				,bodycolor: "yellow"
				,tailcolor: "white"
				,foodcolor: "orange"
			}, options)
		this.loadingindex = 0

		$(this).each(function () {

			$(this).css("background-color", settings.mainbackcolor)
			this.snake = {
				body: []
				,speed: settings.minspeed
				,currdir: directions.right
				,nextdir: []
				,food: -1
				,currstate: "loading"
			}
			this.loadingindex = 0
			this.borders = []
			this.borders[0] = Math.round(this.width / settings.scale)
			this.borders[1] = Math.round(this.height / settings.scale)
			for (var i= this.borders[0] * settings.spawnlocation.x - settings.spawnlength; i < this.borders[0] * settings.spawnlocation.x; i++)
				this.snake.body.unshift({x:i, y:Math.round(this.borders[1] * settings.spawnlocation.y)})			
			mainloop(this)

			$(this).keydown(function (event) {
				if (this.snake.currstate == "loading") {
					var nextmove
					if (event.keyCode == 37)
						nextmove = directions.left
					else if (event.keyCode == 38)
						nextmove = directions.up
					else if (event.keyCode == 39)
						nextmove = directions.right
					else if (event.keyCode == 40)
						nextmove = directions.down
					else if (event.keyCode == 27)
						stop(this)
					if (nextmove) {
						var queuable
						if (this.snake.nextdir.length >= 1)
							queuable = checkbuttonqueuable(nextmove, this.snake.nextdir[this.snake.nextdir.length - 1])
						else
							queuable = checkbuttonqueuable(nextmove, this.snake.currdir)	
						if (queuable)
							this.snake.nextdir.push(nextmove)
						start(this)
					}
				}
				else if (this.snake.currstate == "snake") {
					var nextmove
					if (event.keyCode == 37)
						nextmove = directions.left
					else if (event.keyCode == 38)
						nextmove = directions.up
					else if (event.keyCode == 39)
						nextmove = directions.right
					else if (event.keyCode == 40)
						nextmove = directions.down
					else if (event.keyCode == 27)
						stop(this)
					var queuable
					if (this.snake.nextdir.length >= 1)
						queuable = checkbuttonqueuable(nextmove, this.snake.nextdir[this.snake.nextdir.length - 1])
					else
						queuable = checkbuttonqueuable(nextmove, this.snake.currdir)	
					if (queuable)
						this.snake.nextdir.push(nextmove)
				}
			})

			$(this).blur(function () {
				enablescroll()
			})

			$(this).focus(function () {
				disablescroll()
			})
		})
	}

	var reinitiate = function (element) {
		$(element).css("background-color", settings.mainbackcolor)
		element.snake = {
			body: []
			,speed: settings.minspeed
			,currdir: directions.right
			,nextdir: []
			,food: -1
			,currstate: "loading"
		}
		element.loadingindex = 0
		for (var i= element.borders[0] * settings.spawnlocation.x - settings.spawnlength; i < element.borders[0] * settings.spawnlocation.x; i++)
			element.snake.body.unshift({x:i, y:Math.round(element.borders[1] * settings.spawnlocation.y)})
	}

	var mainloop = function (element) {		
		//Pick State And Function Accordingly
		if (element.snake.currstate == "lost") {
			settings.eventcolor(element)
		}
		if (element.snake.currstate == "stop") {
			reinitiate(element)
		}
		else if (element.snake.currstate == "snake" || element.snake.currstate == "loading") {
			//Initialize
			var newhead
			if (!element.snake.nextdir[0])
				element.snake.nextdir[0] = element.snake.currdir
			else
				element.snake.currdir = element.snake.nextdir[0]
			//Load Additional Functions If Needed
			if (element.snake.currstate == "loading")
				loading(element)
			//Get New Location
			if (element.snake.nextdir[0] == directions.right)
				newhead = {x: element.snake.body[0].x + 1, y: element.snake.body[0].y}
			else if (element.snake.nextdir[0] == directions.left)
				newhead = {x: element.snake.body[0].x - 1, y: element.snake.body[0].y}
			else if (element.snake.nextdir[0] == directions.up)
				newhead = {x: element.snake.body[0].x, y: element.snake.body[0].y - 1}
			else if (element.snake.nextdir[0] == directions.down)
				newhead = {x: element.snake.body[0].x, y: element.snake.body[0].y + 1}
			element.snake.nextdir.shift()
			//Check food
					if (newhead.x == element.snake.food.x && newhead.y == element.snake.food.y) {
						regenfood(element)
						if (element.snake.speed >= element.snake.maxspeed)
						element.snake.speed --
					}
					else
						element.snake.body.pop()
			//Check Collision
			if (newhead.x == element.borders[0] || newhead.x < 0 || newhead.y == element.borders[1] || newhead.y < 0)
				stop(element)
			else {
				var tester = true
				$(element.snake.body).each(function(Point) {
					if (newhead.x == element.snake.body[Point].x && newhead.y == element.snake.body[Point].y)
						tester = false
				})
				if (tester)
					element.snake.body.unshift(newhead)
				else
					stop(element)
			}
			//paint And Loop
			paint(element)
		}
		setTimeout(function () {mainloop(element)}, element.snake.speed)
	}

	var loading = function (element) {		
		if (settings.loadcombo[element.loadingindex] != 0)
			element.snake.nextdir.push(settings.loadcombo[element.loadingindex])
		if (element.loadingindex + 1 == settings.loadcombo.length)
			element.loadingindex = 0
		else
			element.loadingindex ++
	}

	var foodcheck = function (element) {
		var tester = false
		$(element.snake.body).each(function (Point) {
			if (element.snake.body[Point].x == element.snake.food.x && element.snake.body[Point].y == element.snake.food.y)
				tester = true
		})
		return tester
	}

	var regenfood = function(element) {
		do
			element.snake.food = {x: Math.round(Math.random()*(element.borders[0] - 1)), y: Math.round(Math.random()*(element.borders[1] - 1))}
		while (foodcheck(element))
	}

	var start = function (element) {
		element.snake.currstate = "snake"
		regenfood(element)
	}

	var stop = function (element) {
		element.snake.currstate = "lost"
	}

	var paint = function(element) {
		var drawer = element.getContext("2d")
		drawer.height = element.clientHeight
		drawer.width = element.clientWidth
		drawer.fillStyle = settings.headcolor
		drawer.clearRect(0, 0, drawer.width, drawer.height)
		$(element.snake.body).each(function(point) {
			if (point == element.snake.body.length - 1)
				drawer.fillStyle = settings.tailcolor
			drawer.fillRect(element.snake.body[point].x * settings.scale, element.snake.body[point].y * settings.scale, settings.scale - 1, settings.scale - 1)
			if (point == 0)
				drawer.fillStyle = settings.bodycolor
		})
		drawer.fillStyle = settings.foodcolor
		drawer.fillRect(element.snake.food.x * settings.scale, element.snake.food.y * settings.scale, settings.scale - 1, settings.scale - 1)
	}

	var checkbuttonqueuable = function (buttona, buttonb) {
			if (buttona == directions.right || buttona == directions.left)
				if (buttonb == directions.right || buttonb == directions.left)
					return false
			if (buttona == directions.down || buttona == directions.up)
				if (buttonb == directions.down || buttonb == directions.up)
					return false
			return true
		}

		var keys = [37, 38, 39, 40]

		function preventdefault(e) {
		e = e || window.event
			if (e.preventDefault)
				e.preventDefault()
			e.returnValue = false
		}

		function keydown(e) {
			for (var i = keys.length; i--;) {
				if (e.keyCode === keys[i]) {
					preventdefault(e)
					return
				}
			}
		}

		function wheel(e) {
			preventdefault(e)
		}

		function disablescroll() {
			if (window.addEventListener) {
				window.addEventListener('DOMMouseScroll', wheel, false)
			}
			window.onmousewheel = document.onmousewheel = wheel
			document.onkeydown = keydown
		}

		function enablescroll() {
			if (window.removeEventListener) {
				window.removeEventListener('DOMMouseScroll', wheel, false)
			}
			window.onmousewheel = document.onmousewheel = document.onkeydown = null
		}

})(jQuery);