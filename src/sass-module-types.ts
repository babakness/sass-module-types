#!/usr/bin/env node
import { outputDtsFiles as processDts  } from './index'
import program from 'commander'
// const processDts = require('../lib/index').outputDtsFiles
// const program = require('commander')
const version = require('../package.json').version as string

const defaults = {
  // output: './@types',
  base: './src/**',
  pattern: '*.module.scss',
  sassInclude: 'src/'
}

program
  .version(version)
  .usage('[options]')
  .option('-b, --base <path>', `default base is ${ defaults.base }`)
  .option('-i, --sass-include <paths>', `list of paths to includedefault is ${ defaults.sassInclude }`)
  .option('-p, --pattern <pattern>', `default pattern is ${ defaults.pattern  }`)
  .option('-k, --includeIndexKeys', 'enable index look ups on default export (disabled by default)')
  .parse(process.argv)


if( program.args.length > 0 ) {
  console.error('The following parameters not understood:\n', program.args.join(' '))
  console.error('Please use only command options to configure behavior')
  console.error('')
  program.outputHelp();
  process.exit()
}

// if (!process.argv.slice(2).length) {
//   program.outputHelp();

// }
const trim = ( s: string ) => s.trim()
const id = ( i: string ) => i
const sassIncludeArray = program.sassInclude 
  ? program.sassInclude
    .trim()
    .split(',')
    .map( trim )
    .filter( id )
  : []

const sassInclude = ( 
  sassIncludeArray.length > 0 
    ?  sassIncludeArray 
    : [ defaults.sassInclude ] 
)
const base = ( program.base || defaults.base ).trim() as string
const pattern = ( program.pattern || defaults.pattern ).trim() as string
const objectIndex = ( program.includeIndexKeys || false ) as boolean
const watchPattern = `${base}/${pattern}`.replace( /\/+/, '/' ) as string
processDts({watchPattern, objectIndex, sassInclude})
