#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const peggy = require('peggy')
const rollup = require('rollup').rollup

const examplesDir = path.resolve(__dirname, 'examples')
const schemasDir = path.resolve(__dirname, 'schemas')
const examplesOutPath = path.join(examplesDir, 'all.json')
const schemasOutPath = path.join(schemasDir, 'all.json')

const examplesGlob = path.join(examplesDir, '**/*.querypack')
const schemasGlob = path.join(schemasDir, '*/*.qpschema')

const libDir = path.resolve(__dirname, 'lib')
const grammarPath = path.join(libDir, 'parser', 'querypack.pegjs')
const parserOutPath = path.join(libDir, 'parser', 'querypack.js')

const cases = []
const schemas = {}

const globedSchemas = glob.sync(schemasGlob)
globedSchemas.forEach(function (schemaPath) {
  const schemaNameAndVersion = schemaPath.replace(
    /^.*\/([^/]+)\/([^/]+)\.qpschema$/,
    '$1.$2'
  )
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
  schemas[schemaNameAndVersion] = schema
})

fs.writeFileSync(schemasOutPath, JSON.stringify(schemas, null, 2))

const globedExamples = glob.sync(examplesGlob)
globedExamples.forEach(function (queryPackPath) {
  const jsonPath = queryPackPath.replace(/\.querypack$/, '.json')
  const queryPackContent = fs.readFileSync(queryPackPath, 'utf8')
  const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

  const schemaId = queryPackContent.split(';')[0]
  const schema = schemas[schemaId]

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

const mergedOutput = JSON.stringify(cases, null, 2)
fs.writeFileSync(examplesOutPath, mergedOutput)

const grammar = fs.readFileSync(grammarPath, 'utf8')
const parserSource = peggy.generate(grammar, {
  output: 'source',
  exportVar: 'module.exports'
})
fs.writeFileSync(parserOutPath, 'module.exports = ' + parserSource)

async function buildWebBundle () {
  const webBundle = await rollup({
    input: './index.js',
    plugins: [
      require('rollup-plugin-node-resolve')({
        preferBuiltins: true
      }),
      require('rollup-plugin-json')(),
      require('rollup-plugin-commonjs')()
    ]
  })
  await webBundle.write({
    file: './web.js',
    format: 'iife',
    exports: 'named',
    name: 'querypack'
  })
}

buildWebBundle()
  .catch(e => console.error(e))
