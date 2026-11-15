import process from "node:process";

// Node-only: rewrite Error.stack through .map files so frames show src/ paths.
process.setSourceMapsEnabled(true);
