# NodeCon
> A Node.js debugging console for Mac/Windows/Linux.

![screenshot](http://oi57.tinypic.com/zvevtg.jpg)

**This currently does not work.**

With the changes to [V8's debugger protocol](https://developer.chrome.com/devtools/docs/debugger-protocol), it'd be best to:

* Wait for that implementation in Node 0.12.x
* Switch to [node-inspector](https://github.com/node-inspector/node-inspector) once it's caught up
* Likely patch node-inspector to decouple it from its CLI
