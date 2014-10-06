"use strict";

var debuggerProxy = requireNode("./lib/backend/debuggerProxy");
//var terminalProxy = requireNode("./lib/backend/terminalProxy");

debuggerProxy.start({ httpPort:5858, boundHost:"localhost" });

nodecon.debuggerConsole.add("http://localhost:5858/client");
