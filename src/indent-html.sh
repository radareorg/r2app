#!/usr/bin/env node
const p=require("pretty");
const r= p(fs.readFileSync('index.html').toString());
fs.writeFileSync('index.html', r);
