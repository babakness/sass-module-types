#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var commander_1 = __importDefault(require("commander"));
// const processDts = require('../lib/index').outputDtsFiles
// const program = require('commander')
var version = require('../package.json').version;
var defaults = {
    // output: './@types',
    base: './src/**',
    pattern: '*.module.scss',
    sassInclude: 'src/'
};
commander_1.default
    .version(version)
    .usage('[options]')
    .option('-b, --base <path>', "default base is " + defaults.base)
    .option('-i, --sass-include <paths>', "list of paths to includedefault is " + defaults.sassInclude)
    .option('-p, --pattern <pattern>', "default pattern is " + defaults.pattern)
    .parse(process.argv);
if (commander_1.default.args.length > 0) {
    console.error('The following parameters not understood:\n', commander_1.default.args.join(' '));
    console.error('Please use only command options to configure behavior');
    console.error('');
    commander_1.default.outputHelp();
    process.exit();
}
// if (!process.argv.slice(2).length) {
//   program.outputHelp();
// }
var trim = function (s) { return s.trim(); };
var id = function (i) { return i; };
var sassIncludeArray = commander_1.default.sassInclude
    ? commander_1.default.sassInclude
        .trim()
        .split(',')
        .map(trim)
        .filter(id)
    : [];
var sassInclude = (sassIncludeArray.length > 0
    ? sassIncludeArray
    : [defaults.sassInclude]);
var base = (commander_1.default.base || defaults.base).trim();
var pattern = (commander_1.default.pattern || defaults.pattern).trim();
var watchPattern = (base + "/" + pattern).replace(/\/+/, '/');
console.log({ watchPattern: watchPattern, sassInclude: sassInclude });
index_1.outputDtsFiles({ watchPattern: watchPattern, sassInclude: sassInclude });
