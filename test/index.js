var test = require("tape");
var querypack = require("../index");
var testCases = require("../examples/all.json");
var lintSchema = require("../lib/schema-linter");

var schemaNames = Object.keys(querypack.schemas);
schemaNames.forEach(function (schemaName) {
  test("validate schema " + schemaName, function (t) {
    var schema = querypack.schemas[schemaName];
    var errors = lintSchema(schema);
    t.deepEqual(errors, [], "expected no schema validation errors");
    t.end();
  });
});

testCases.forEach(function (testCase) {
  var schemaVersion =
    testCase.schema.name + "." + testCase.schema.version + " ";
  test("encoding " + schemaVersion + testCase.name, function (t) {
    var schema = testCase.schema;
    var roots = JSON.parse(testCase.json);
    var result = querypack.encode(roots, schema);
    t.equal(result, testCase.querypack, "encoded output should match expected");
    t.end();
  });

  test("decoding " + schemaVersion + testCase.name, function (t) {
    var result = querypack.decode(testCase.querypack);
    var expected = JSON.parse(testCase.json);
    t.deepEqual(result, expected, "decoded output should match expected");
    t.end();
  });
});
