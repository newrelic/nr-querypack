#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var glob = require('glob')
var PEG = require('pegjs')

var examplesDir = path.resolve(__dirname, 'examples')
var schemasDir = path.resolve(__dirname, 'schemas')
var examplesOutPath = path.join(examplesDir, 'all.json')
var schemasOutPath = path.join(schemasDir, 'all.json')

var examplesGlob = path.join(examplesDir, '**/*.querypack')
var schemasGlob = path.join(schemasDir, '*/*.qpschema')

var libDir = path.resolve(__dirname, 'lib')
var grammarPath = path.join(libDir, 'parser', 'querypack.pegjs')
var parserOutPath = path.join(libDir, 'parser', 'querypack.js')

var cases = []
var schemas = {}

glob(schemasGlob, function (err, results) {
  if (err) throw err

  results.forEach(function (schemaPath) {
    var schemaNameAndVersion = schemaPath.replace(
      /^.*\/([^/]+)\/([^/]+)\.qpschema$/,
      '$1.$2'
    )
    var schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
    schemas[schemaNameAndVersion] = schema
  })

  fs.writeFileSync(schemasOutPath, JSON.stringify(schemas, null, 2))
})

glob(examplesGlob, function (err, results) {
  if (err) throw err

  results.forEach(function (queryPackPath) {
    var jsonPath = queryPackPath.replace(/\.querypack$/, '.json')
    var queryPackContent = fs.readFileSync(queryPackPath, 'utf8')
    var jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

    var schemaId = queryPackContent.split(';')[0]
    var schema = schemas[schemaId]

    if (!schema) {
      throw new Error(
        "Did not find schema with identifier: '" + schemaId + "'"
      )
    }

    cases.push({
      name: path.basename(queryPackPath, '.querypack'),
      querypack: queryPackContent,
      json: JSON.stringify(jsonContent),
      schema: schema
    })
  })

  var mergedOutput = JSON.stringify(cases, null, 2)

  fs.writeFileSync(examplesOutPath, mergedOutput)
})

var grammar = fs.readFileSync(grammarPath, 'utf8')
var parserSource = PEG.buildParser(grammar, {
  output: 'source',
  exportVar: 'module.exports'
})
fs.writeFileSync(parserOutPath, 'module.exports = ' + parserSource)
