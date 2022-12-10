const test = require('tape')
const querypack = require('../index')
const testCases = require('../examples/all.json')
const lintSchema = require('../lib/schema-linter')

const schemaNames = Object.keys(querypack.schemas)
schemaNames.forEach(function (schemaName) {
  test('validate schema ' + schemaName, function (t) {
    const schema = querypack.schemas[schemaName]
    const errors = lintSchema(schema)
    t.deepEqual(errors, [], 'expected no schema validation errors')
    t.end()
  })
})

testCases.forEach(function (testCase) {
  const schemaVersion = testCase.schema.name + '.' + testCase.schema.version + ' '
  test('encoding ' + schemaVersion + testCase.name, function (t) {
    const schema = testCase.schema
    const roots = JSON.parse(testCase.json)
    const result = querypack.encode(roots, schema)
    t.equal(result, testCase.querypack, 'encoded output should match expected')
    t.end()
  })

  test('decoding ' + schemaVersion + testCase.name, function (t) {
    const result = querypack.decode(testCase.querypack)
    const expected = JSON.parse(testCase.json)
    t.deepEqual(result, expected, 'decoded output should match expected')
    t.end()
  })
})
