"use strict";
(function()
{
	var child_process = require("child_process");
	var fs = require("fs");
	var path = require("path");
	
	var NODE = "node";		// state, for inspecting node data
	var SHELL = "shell";	// state, for bash commands
	
	var consoleViewInstance;
	var _cwd;
	var iframe;
	var _state;
	
	
	
	function add(url)
	{
		loadStylesheet("lib/frontend/debuggerConsole.css", function(styles)
		{
			addInspector(url, styles, function()
			{
				extendInspector();
			});
		});
	}
	
	
	
	function addInspector(url, styles, callback)
	{
		iframe = document.createElement("iframe");
		iframe.src = url;
		
		iframe.onload = function()
		{
			// Apply styles and select console
			iframe.contentDocument.querySelector(".toolbar-item.console").click();
			iframe.contentDocument.head.appendChild(styles);
			cwd(process.env.HOME);
			state(SHELL);
			
			// Add state styles to each newly added console message
			new MutationObserver( function(mutations)
			{
				mutations.forEach( function(mutation)
				{
					for (var i=mutation.addedNodes.length-1; i>=0; i--)
					{
						mutation.addedNodes[i].className += " nodecon-state-"+state();
						
						if (state() == SHELL)
						{
							mutation.addedNodes[i].title = cwd();
						}
					}
				});
			}).observe(
				iframe.contentDocument.querySelector("#console-messages .console-group-messages"),
				{childList:true}
			);
			
			// Avoid having the text cursor too far to the left
			iframe.contentDocument.querySelector("#console-prompt").addEventListener("input", function(event)
			{
				if (event.target.innerHTML=="") clearInput();
			});
			
			setTimeout( function(){ clearInput() });
			
			callback();
		};
		
		document.body.appendChild(iframe);
	}
	
	
	
	function clearInput()
	{
		// Silly hack to avoid having text cursor too far to the left
		iframe.contentDocument.querySelector("#console-prompt").innerHTML = "<hr>";
		
		focus();
	}
	
	
	
	function cwd(newValue)
	{
		if (newValue && newValue != _cwd)
		{
			iframe.contentDocument.querySelector("#console-prompt").setAttribute("title", newValue);
			
			_cwd = newValue;
		}
		
		return _cwd;
	}
	
	
	
	function extendInspector()
	{
		// Original: node_modules/weinre/web/client/ConsoleView.js
		iframe.contentWindow.WebInspector.ConsoleView.prototype._enterKeyPressed_super = iframe.contentWindow.WebInspector.ConsoleView.prototype._enterKeyPressed;
		iframe.contentWindow.WebInspector.ConsoleView.prototype._enterKeyPressed = function(event)
		{
			if (!consoleViewInstance) consoleViewInstance = this;
			
			switch (state())
			{
				case NODE:
				{
					log( this.prompt.text );
					break;
				}
				/*case JAVASCRIPT:
				{
					this._enterKeyPressed_super(event);
					break;
				}*/
				case SHELL:
				{
					shell( this.prompt.text );
					break;
				}
			}
			
			// Copied from: node_modules/weinre/web/client/ConsoleView.js :: _enterKeyPressed
			consoleViewInstance.prompt.history.push( consoleViewInstance.prompt.text );
			consoleViewInstance.prompt.historyOffset = 0;
			consoleViewInstance.prompt.text = "";
			
			// Take splace after promp.text's event
			setTimeout(function(){ clearInput() });
		}
	}
	
	
	
	function focus()
	{
		// Didn't work without a timeout
		setTimeout( function()
		{
			iframe.contentDocument.querySelector("#console-prompt").focus();
		});
	}
	
	
	
	function loadStylesheet(url, callback)
	{
		var tempIframe = document.createElement("iframe");
		tempIframe.src = url;
		
		tempIframe.onload = function()
		{
			var style = document.createElement("style");
			style.innerHTML = tempIframe.contentDocument.querySelector("pre").innerHTML;
			
			document.body.removeChild(tempIframe);
			tempIframe = null;
			
			callback(style);
		};
		
		document.body.appendChild(tempIframe);
	}
	
	
	
	function log(str)
	{
		var commandMessage = new iframe.contentWindow.WebInspector.ConsoleCommand(str);
		
		//consoleViewInstance.addMessage( {command:"<b>asdf</b>"} )
		console.log(commandMessage)
		consoleViewInstance.addMessage(commandMessage);
	}
	
	
	
	function shell(command)
	{
		var args = command.split(" ");
		
		var app = args[0];
		args.shift();	// remove first index
		
		log(command);
		
		if (command=="node" || command.indexOf("node ")==0)
		{
			// Avoid above log() from showing node state
			setTimeout(function(){ state(NODE) });
			
			// TODO :: use --debug
			// TODO :: use node-inspector?
			var instance = child_process.spawn(app, args, {cwd:cwd()});
			
			// TODO :: send data to weinre?
			// IDEAS :: weinre/target/WeinreTargetEventsImpl.amd.js
			
			instance.on("close", function(code)
			{
				this.removeAllListeners();
			});
		}
		else if (command=="cd" || command.indexOf("cd ")==0)
		{
			var newCWD = path.resolve( cwd(), args[0] || process.env.HOME );
			
			fs.exists(newCWD, function(exists)
			{
				if (exists)
				{
					cwd(newCWD);
				}
				else
				{
					log("cd: "+newCWD+": No such file or directory");
				}
			});
		}
		else
		{
			// TODO :: use pty.js when it can be installed?
			var instance = child_process.spawn(app, args, {cwd:cwd()});
			
			instance.stdout.on("data", function(data)
			{
				log( /*window.ansi_up.ansi_to_html(*/ data.toString() /*)*/);
			});
			
			instance.stderr.on("data", function(data)
			{
				log( /*window.ansi_up.ansi_to_html(*/ data.toString() /*)*/);
			});
			
			/*instance.on("error", function(error)
			{
				log(error.message);
			});*/
			
			instance.on("close", function(code)
			{
				this.removeAllListeners();
			});
		}
	}
	
	
	
	function state(newValue)
	{
		if (newValue && newValue != _state)
		{
			var prompt = iframe.contentDocument.querySelector("#console-prompt");
			
			prompt.classList.remove("nodecon-state-"+_state);
			prompt.classList.add("nodecon-state-"+newValue);
			
			_state = newValue;
		}
		
		return _state;
	}
	
	
	
	nodecon.debuggerConsole = { add:add };
})();
