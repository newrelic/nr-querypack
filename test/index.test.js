const querypack = require("../index");
const testCases = require("../examples/all.json");
const lintSchema = require("../lib/schema-linter");

test.each(Object.keys(querypack.schemas))(
  "validate schema %s",
  (schemaName) => {
    const schema = querypack.schemas[schemaName];
    const errors = lintSchema(schema);

    expect(errors).toEqual([]);
  }
);

test.each(testCases)(
  "encoding $schema.name version $schema.version",
  (testCase) => {
    const schema = testCase.schema;
    const roots = JSON.parse(testCase.json);
    const result = querypack.encode(roots, schema);

    expect(result).toEqual(testCase.querypack);
  }
);

test.each(testCases)(
  "decoding $schema.name version $schema.version",
  (testCase) => {
    const result = querypack.decode(testCase.querypack);
    const expected = JSON.parse(testCase.json);

    expect(result).toEqual(expected);
  }
);
