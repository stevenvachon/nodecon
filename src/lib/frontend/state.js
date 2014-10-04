(function()
{
	var currentState = "";
	
	Object.defineProperty(window, "state",
	{
		get: function(){ return currentState },
		set: function(newState)
		{
			if (newState != currentState)
			{
				["debuggerConsole","shellConsole"].forEach( function(view)
				{
					document.getElementById(view).className = view==newState ? "visible" : "hidden";
				});
				
				currentState = newState;
			}
		}
	});
})();
