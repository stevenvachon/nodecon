(function()
{
	var container = document.querySelector("#debuggerConsole");
	var started = false;
	
	
	
	function add()
	{
		var iframe = document.createElement("iframe");
		iframe.src = "http://localhost:8080/client";
		
		iframe.onload = function()
		{
			iframe.contentDocument.querySelector(".toolbar-item.console").click();
		    iframe.contentDocument.querySelector("#toolbar").style.display = "none";
		    
		    iframe.contentDocument.querySelector("#console-status-bar-item").style.display = "none";
		};
		
		container.appendChild(iframe);
	}
	
	
	
	function remove()
	{
		var iframe = container.querySelector("iframe");
		
		if (iframe)
		{
			container.removeChild(iframe);
		}
	}
	
	
	
	/* IS THIS NEEDED? */
	function start()
	{
		if (!started)
		{
			var target = document.createElement("script");
			target.src = "http://localhost:8080/target/target-script-min.js";
			
			target.onload = function()
			{
				target.onload = null;
				started = true;
				add();
			};
			
			document.head.appendChild(target);
		}
		else
		{
			add();
		}
	}
	
	
	
	window.views.debuggerConsole = { add:start, remove:remove };
})();
