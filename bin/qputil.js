#!/usr/bin/env node

const concat = require('concat-stream')
const yargs = require('yargs')
const fs = require('fs')

const querypack = require('../index')
const lintSchema = require('../lib/schema-linter')
let schemaPath
let infilePath

const config = yargs
  .usage('$0 command')

  .boolean('r')
  .default(false)
  .alias('r', 'relative-timestamps')
  .describe('r', 'if true, prints relative timestamps')

  .command('encode', 'encode from JSON to querypack', function (args) {
    args
      .usage('$0 encode <input path> <schema path>')
      .demand(3, 'Please specify a schema and an input file to encode')
      .boolean('o')
      .alias('o', 'omit-defaults')
      .default('o', true)
      .describe('o', 'Omit field values when they match the defaults specified in the schema')
  })
  .command('decode', 'decode from querypack to JSON', function (args) {
    args.usage('$0 decode <input path> [<schema path>]')
    args.demand(2, 'Please specify an input file to decode')
  })
  .command('decode-batch', 'decode from JSON results returned by an insights query', function (args) {
    args.usage('$0 decode-batch <input path>')
    args.demand(2, 'Please specify an input file to decode')
  })
  .command('debug', 'dump a partially-decoded version of the querypack input for debugging', function (args) {
    args.usage('$0 debug <input path>')
    args.demand(2, 'Please specify an input file to decode')
  })
  .command('validate', 'validate querypack format against a schema', function (args) {
    args.usage('$0 validate <input path> <schema path>')
    args.demand(3, 'Please specify a schema and an input file to encode')
  })
  .command('validate-schema', 'validate a querypack schema', function (args) {
    args.usage('$0 validate-schema <schema path>')
    args.demand(2, 'Please specify a schema to validate')
  })
  .demand(1, 'Please specify a command')
  .help('h')
  .alias('h', 'help')
  .argv

const command = config._[0]

switch (command) {
  case 'decode-batch':
  case 'decode':
  case 'debug':
    infilePath = config._[1]
    break

  case 'encode':
    infilePath = config._[1]
    schemaPath = config._[2]
    break

  case 'validate':
    infilePath = config._[1]
    schemaPath = config._[2]
    break

  case 'validate-schema':
    infilePath = config._[1]
    break

  default:
    console.error('Unknown command')
    console.log(yargs.help())
    process.exit(1)
}

let schema
if (schemaPath) {
  try {
    const schemaText = fs.readFileSync(schemaPath)
    schema = JSON.parse(schemaText)
  } catch (err) {
    console.error("Could not load schema at '" + schemaPath + "': " + err)
    process.exit(1)
  }
}

let infileStream
if (infilePath === '-') {
  infileStream = process.stdin
} else {
  infileStream = fs.createReadStream(infilePath, { encoding: 'utf8' })
}

switch (command) {
  case 'encode':
    infileStream.pipe(concat(function (body) {
      body = JSON.parse(body.toString())
      const result = querypack.encode(body, schema, config)
      process.stdout.write(result)
    }))
    break

  case 'decode':
    infileStream.pipe(concat(function (body) {
      const nodes = querypack.decode(body.toString(), { decodeDates: config.r })
      console.log(JSON.stringify(nodes, null, 2))
    }))
    break

  case 'debug':
    infileStream.pipe(concat(function (body) {
      dumpForDebugging(body)
    }))
    break

  case 'validate':
    infileStream.pipe(concat(function (body) {
      body = body.toString()
      const nodes = querypack.decode(body, { strict: true })
      console.log(JSON.stringify(nodes, null, 2))
    }))
    break

  case 'validate-schema':
    infileStream.pipe(concat(function (body) {
      const schema = JSON.parse(body)
      const errors = lintSchema(schema)
      if (errors && errors.length) {
        console.log('Schema is not valid.\nErrors:\n')
        errors.forEach(function (err) {
          console.log('  ' + err)
        })
        process.exit(1)
      } else {
        console.log('Schema is valid')
      }
    }))
    break

  case 'decode-batch':
    infileStream.pipe(concat(function (body) {
      body = JSON.parse(body)
      const events = body && body.results && body && body.results[0] && body.results[0].events
      if (!events) {
        return console.log('no events found, should be formatted as {body: {results: [{events: [**events**]}]}}')
      }

      events.forEach(event => {
        if (!event.event) return event
        if (event.event['nr.querypack']) {
          event.event.decodedQuerypack = querypack.decode(event.event['nr.querypack'], { decodeDates: config.r })
        }
      })
      console.log(JSON.stringify(body, null, 2))
    }))
    break
}

function dumpForDebugging (inputText) {
  const parser = require('../lib/parser/querypack')

  const result = parser.parse(inputText.toString())

  console.log('Parsed nodes:')
  for (let i = 0; i < result.nodes.length; i++) {
    const node = result.nodes[i]
    console.log('[' + i + ']: ' + [node.typeId, node.childCount].concat(node.fields).join(','))
  }
  console.log('')

  const strings = []
  result.nodes.forEach(function (node) {
    node.fields.forEach(function (field) {
      if (typeof field === 'string') strings.push(field)
    })
  })

  console.log('String table:')
  for (let i = 0; i < strings.length; i++) {
    console.log(i + ' [' + i.toString(36) + ']: ' + strings[i])
  }
}
