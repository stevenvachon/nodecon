var child_process = require("child_process");
var path = require("path");
var weinre = require("weinre");

var appRoot = path.resolve( __dirname+"/../../" );
var weinreBin;



function getWeinreBin()
{
	if (!weinreBin)
	{
		var weinreDir = appRoot+"/node_modules/weinre";
		var weinrePkgBin = require(weinreDir+"/package.json").bin;
		
		if (typeof weinrePkgBin == "object")
		{
			weinrePkgBin = weinrePkgBin.weinre;
		}
		
		weinreBin = path.resolve(weinreDir, weinrePkgBin);
		weinreBin = path.relative(appRoot, weinreBin);
	}
	
	return weinreBin;
}



function shell(command)
{
	var args = command.split(" ");
	
	var app = args[0];
	args.shift();	// remove first index
	
	child_process.spawn(app, args, {cwd:appRoot, stdio:"inherit"})/*.on("exit", function(code)
	{
		this.removeAllListeners();
	})*/;
}



function start(options)
{
	var command = "node "+ getWeinreBin();
	
	if (options)
	{
		for (var name in options)
		{
			command += " --"+name+" "+options[name];
		}
	}
	
	shell(command);
}



function stop()
{
	console.log("stopped?");
}



module.exports = { start:start, stop:stop };
