import { extractICSS } from 'icss-utils';
import * as chokidar from 'chokidar'
import * as sass from 'sass'
import { promisify } from 'util'
import postcss from 'postcss'
import * as fs from 'fs'
import postcssIcssSelectors from 'postcss-icss-selectors'
import postcssNested from 'postcss-nested'
// import * as strip from 'strip-css-singleline-comments/sync'
import pipeline from 'soultrain/lib/function/pipeline'
import { prop, keys } from 'soultrain/lib/object'
import mapArray from 'soultrain/lib/array/mapArray'
import bind from 'soultrain/lib/function/bindStrict'
// import { split } from 'soultrain/lib/string'
// import last from 'soultrain/lib/array/last'
// import append from 'soultrain/lib/array/append'
import { trace as log } from 'soultrain/lib/logging'


const renderPromise = promisify(sass.render)
const writePromise = promisify(fs.writeFile)
const unlinkPromise = promisify(fs.unlink)
const processor = postcss(
  postcssNested,
  postcssIcssSelectors({ mode: 'local' }),
)


const toCamelCase = ( str: string ) => str.replace(/-+(\w)/g, ( _match, firstLetter: string ) => firstLetter.toUpperCase() )
// const getPath = ( outputDir: string, file: string ) => `${outputDir}/${file}.d.ts`

const getDtsContent = async ( sassInclude: string[], includeIndexKey: boolean, path: string ) => {
  try {
    const result = await renderPromise({
      file: path,
      includePaths: sassInclude 
    })
      // hmm... can't be piped...
    const lazyResult = processor.process(result.css.toString())

    const classes = pipeline(
      lazyResult,
      prop('root'),
      extractICSS,
      prop('icssExports'),
      keys,
      mapArray(toCamelCase)
    )

    const namedExports = classes
      .map( cssClass => `export const ${cssClass}: string;` )
      .join('\n')

    const defaultExport = 'export default {} as {\n'
      + classes.map( cssClass => `  ${cssClass}: string,`).join('\n')
      + ( includeIndexKey ? '\n  [ key: string ]: string' : '' )
      + '\n}'
    
    return `${namedExports}\n${defaultExport}`
  } catch (e) {
    log(e)
    return ''
  }
}

// const shaveLeft = ( remove: string, source: string ) => {
//   return source[0] === remove 
//     ? source.slice(1)
//     : source
// }

// const shaveRight = ( remove: string, source: string ) => {
//   return source[ source.length ] === remove 
//     ? source.slice(0,1)
//     : source
// }

// const shave = ( remove: string, source: string ) => pipeline(
//   source,
//   bind(shaveLeft, remove),
//   bind(shaveRight, remove)
// )

// const prependString = (a: string, b: string) => a.concat(b)
// const appendString = (a: string, b: string) => b.concat(a)

// const getWritePath = ( outputDir: string, file: string ) => {
//   return pipeline(
//     file,
//     bind(shaveRight, '/'),
//     split('/'),
//     last,
//     bind(prependString,`${outputDir}/`),
//     bind(appendString,`.d.ts`),
//   ).replace(/\+/,'/')
// }

const writeDtsContent = async (file: string, content: string) => {
  try {
    // log('gang',{file})
    // const _ = await writePromise( getWritePath( outputDir, file ), content, 'utf8' )
    const _ = await writePromise( `${file}.d.ts`, content, 'utf8' )
    // log(`wrote ${file}`)
  } catch (e) {
    log(e)
    log(''
      + `Error writing file ${file}, are you sure the \n`
      + `permissions set correctly?`
    )
  }
}

const addOrUpdateAction = async ( sassInclude: string[], objectIndex: boolean, file: string ) => pipeline(
  await getDtsContent( sassInclude, objectIndex, file ),
  await bind(writeDtsContent, file),
)


const deleteAction = async ( file: string ) => {
  try {
    const message = await unlinkPromise( `${file}.d.ts` )
    if( message !== null ) {
      log( message )
    }
  } catch ( e ) {
    log( e )
    log(''
      + `Error unlinking file ${file}, are you sure the \n`
      + `permissions set correctly?`
    )
  }
}

export const outputDtsFiles = ( { watchPattern = '*.module.scss', objectIndex = false, sassInclude = [ 'src/' ] } ) => {
  // log({watchPattern})

  const watcher = chokidar.watch( watchPattern, { depth: 10 } )

  watcher
    .on('add', bind( addOrUpdateAction, sassInclude, objectIndex ) )
    .on('change', bind( addOrUpdateAction, sassInclude, objectIndex ) )
    .on('unlink', deleteAction )
}

export default outputDtsFiles
