#!/usr/bin/env node
const fs=require("fs");
const p=require("pretty");
const args = process.argv;
args.shift();
args.shift();
for (let file of args) {
  const r= p(fs.readFileSync(file).toString());
  fs.writeFileSync(file, r);
}
