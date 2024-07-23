#!/usr/bin/env node

var concat = require('concat-stream')
var yargs = require('yargs')
var fs = require('fs')

var querypack = require('../index')
var lintSchema = require('../lib/schema-linter')
var schemaPath
var infilePath

var config = yargs
  .usage('$0 command')

  .boolean('r')
  .default('r', false)
  .alias('r', 'relative-timestamps')
  .describe('r', 'if true, prints relative timestamps')

  .command('encode', 'encode from JSON to querypack', function (args) {
    return args
      .usage('$0 encode <input path> <schema path>')
      .demand(2, 'Please specify a schema and an input file to encode')
      .boolean('o')
      .alias('o', 'omit-defaults')
      .default('o', true)
      .describe(
        'o',
        'Omit field values when they match the defaults specified in the schema'
      )
  })
  .command('decode', 'decode from querypack to JSON', function (args) {
    return args
      .usage('$0 decode <input path> [<schema path>]')
      .demand(1, 'Please specify an input file to decode')
  })
  .command(
    'decode-batch',
    'decode from JSON results returned by an insights query',
    function (args) {
      return args.usage('$0 decode-batch <input path>')
        .demand(1, 'Please specify an input file to decode')
    }
  )
  .command(
    'debug',
    'dump a partially-decoded version of the querypack input for debugging',
    function (args) {
      return args.usage('$0 debug <input path>')
        .demand(1, 'Please specify an input file to decode')
    }
  )
  .command(
    'validate',
    'validate querypack format against a schema',
    function (args) {
      return args.usage('$0 validate <input path> <schema path>')
        .demand(2, 'Please specify a schema and an input file to encode')
    }
  )
  .command('validate-schema', 'validate a querypack schema', function (args) {
    return args.usage('$0 validate-schema <schema path>')
      .demand(1, 'Please specify a schema to validate')
  })
  .demandCommand()
  .argv

var command = config._[0]
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
    yargs.showHelp()
    process.exit(1)
}

if (schemaPath) {
  try {
    var schemaText = fs.readFileSync(schemaPath)
    var schema = JSON.parse(schemaText)
  } catch (err) {
    console.error("Could not load schema at '" + schemaPath + "': " + err)
    process.exit(1)
  }
}

var infileStream
if (infilePath === '-') {
  infileStream = process.stdin
} else {
  infileStream = fs.createReadStream(infilePath, { encoding: 'utf8' })
}

switch (command) {
  case 'encode':
    infileStream.pipe(
      concat(function (body) {
        body = JSON.parse(body.toString())
        var result = querypack.encode(body, schema, config)
        process.stdout.write(result)
      })
    )
    break

  case 'decode':
    infileStream.pipe(
      concat(function (body) {
        var nodes = querypack.decode(body.toString(), {
          decodeDates: config.r
        })
        console.log(JSON.stringify(nodes, null, 2))
      })
    )
    break

  case 'debug':
    infileStream.pipe(
      concat(function (body) {
        dumpForDebugging(body)
      })
    )
    break

  case 'validate':
    infileStream.pipe(
      concat(function (body) {
        body = body.toString()
        var nodes = querypack.decode(body, { strict: true })
        console.log(JSON.stringify(nodes, null, 2))
      })
    )
    break

  case 'validate-schema':
    infileStream.pipe(
      concat(function (body) {
        var schema = JSON.parse(body)
        var errors = lintSchema(schema)
        if (errors && errors.length) {
          console.log('Schema is not valid.\nErrors:\n')
          errors.forEach(function (err) {
            console.log('  ' + err)
          })
          process.exit(1)
        } else {
          console.log('Schema is valid')
        }
      })
    )
    break

  case 'decode-batch':
    infileStream.pipe(
      concat(function (body) {
        body = JSON.parse(body)
        var events =
          body &&
          body.results &&
          body &&
          body.results[0] &&
          body.results[0].events
        if (!events) {
          return console.log(
            'no events found, should be formatted as {body: {results: [{events: [**events**]}]}}'
          )
        }

        events.forEach((event) => {
          if (!event.event) return event
          if (event.event['nr.querypack']) {
            event.event.decodedQuerypack = querypack.decode(
              event.event['nr.querypack'],
              { decodeDates: config.r }
            )
          }
        })
        console.log(JSON.stringify(body, null, 2))
      })
    )
    break
}

function dumpForDebugging (inputText) {
  var parser = require('../lib/parser/querypack')

  var result = parser.parse(inputText.toString())

  console.log('Parsed nodes:')
  for (i = 0; i < result.nodes.length; i++) {
    var node = result.nodes[i]
    console.log(
      '[' +
        i +
        ']: ' +
        [node.typeId, node.childCount].concat(node.fields).join(',')
    )
  }
  console.log('')

  var strings = []
  result.nodes.forEach(function (node) {
    node.fields.forEach(function (field) {
      if (typeof field === 'string') strings.push(field)
    })
  })

  console.log('String table:')
  for (var i = 0; i < strings.length; i++) {
    console.log(i + ' [' + i.toString(36) + ']: ' + strings[i])
  }
}
