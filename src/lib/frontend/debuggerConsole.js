"use strict";
(function()
{
	var child_process = require("child_process");
	
	var NODE = "node";		// state, for inspecting node data
	var SHELL = "shell";	// state, for bash commands
	
	var consoleViewInstance;
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
			state(SHELL);
			
			// Add state styles to each newly added console message
			var observer = new MutationObserver( function(mutations)
			{
				mutations.forEach( function(mutation)
				{
					for (var i=mutation.addedNodes.length-1; i>=0; i--)
					{
						mutation.addedNodes[i].className += " nodecon-state-"+state();
					}
				});
			});
			
			observer.observe( iframe.contentDocument.querySelector("#console-messages .console-group-messages"), {childList:true} );
			
			callback();
		};
		
		document.body.appendChild(iframe);
	}
	
	
	
	function clearInput()
	{
		// Copied from: node_modules/weinre/web/client/ConsoleView.js :: _enterKeyPressed
		consoleViewInstance.prompt.history.push( consoleViewInstance.prompt.text );
		consoleViewInstance.prompt.historyOffset = 0;
		consoleViewInstance.prompt.text = "";
		
		/*function printResult(result)
		{
			self.prompt.history.push(str);
			self.prompt.historyOffset = 0;
			self.prompt.text = "";
			
			WebInspector.settings.consoleHistory = self.prompt.history.slice(-30);
			
			self.addMessage(new WebInspector.ConsoleCommandResult(result, commandMessage));
		}
		
		this.evalInInspectedWindow(str, "console", true, printResult);*/
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
					clearInput();
					break;
				}
			}
		}
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
		
		consoleViewInstance.addMessage(commandMessage);
	}
	
	
	
	function shell(command)
	{
		var args = command.split(" ");
		
		var app = args[0];
		args.shift();	// remove first index
		
		// TODO :: use pty.js when it can be installed
		var instance = child_process.spawn(app, args);
		
		if (command=="node" || command.indexOf("node ")==0)
		{
			state(NODE);
			
			// ideas
			// weinre/target/WeinreTargetEventsImpl.amd.js
			
			// TODO :: send data to weinre?
			
			instance.on("close", function(code)
			{
				this.removeAllListeners();
			});
		}
		else
		{
			instance.stdout.on("data", function(data)
			{
				log( /*window.ansi_up.ansi_to_html(*/ data.toString() /*)*/);
			});
			
			instance.stderr.on("data", function(data)
			{
				log( /*window.ansi_up.ansi_to_html(*/ data.toString() /*)*/);
			});
			
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
