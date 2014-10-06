"use strict";

// Some scripts use require()
global.requireNode = global.require;
window.requireNode = window.require;

// Avoid page change on errors
process.on("uncaughtException", function(e){});

window.nodecon = {};
