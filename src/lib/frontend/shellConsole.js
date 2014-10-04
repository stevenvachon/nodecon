(function()
{
	var child_process = require("child_process");
	
	var container = document.querySelector("#shellConsole");
	var input = container.querySelector("input[type=text]");
	var log = container.querySelector(".log");
	
	var path = "~";	// %HOME% for windows?
	var stderr = new Buffer("");
	var stdout = new Buffer("");
	
	
	
	function shell(command)
	{
		var args = command.split(" ");
		
		var app = args[0];
		args.shift();	// remove first index
		
		// TODO :: use pty.js when it can be installed
		var instance = child_process.spawn(app, args, {cwd:path, detached:true, stdio:["ignore",stdout,stderr]});
		
		/*instance.stdout.on("data", function(data)
		{
			log.innerHTML += window.ansi_up.ansi_to_html( data.toString() );
		});
		
		instance.stderr.on("data", function(data)
		{
			log.innerHTML += window.ansi_up.ansi_to_html( data.toString() );
		});
		
		instance.on("close", function(code)
		{
			log.innerHTML += "CLOSED";
			this.removeAllListeners();
		});*/
	}
	
	
	
	function sendCommand(command)
	{
		
	}
	
	
	
	input.addEventListener("keypress", function(event)
	{
		if (event.keyCode == 13)
		{
			shell(input.value);
			console.log(stderr, stdout)
			input.value = "";
		}
	});
	
	
	
	window.views.shellConsole = {};
})();
