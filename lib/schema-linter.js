var Joi = require("joi");

module.exports = lintSchema;

var fieldType = Joi.string()
  .valid("timestamp")
  .valid("string")
  .valid("integer")
  .valid("double")
  .valid("boolean")
  .valid("nodeList")
  .valid("enum")
  .valid("node");

var fieldSpec = Joi.object().keys({
  name: Joi.string().required(),
  type: fieldType.required(),
  relative: Joi.when("type", {
    is: "timestamp",
    then: Joi.string().valid(["first", "previous"]).required(),
    otherwise: Joi.forbidden(),
  }),
  defaultValue: Joi.when("type", {
    is: "timestamp",
    then: Joi.number().integer(),
  })
    .when("type", { is: "string", then: Joi.string() })
    .when("type", { is: "integer", then: Joi.number().integer() })
    .when("type", { is: "boolean", then: Joi.boolean() })
    .when("type", { is: "nodeList", then: Joi.array() })
    .when("nullable", {
      is: Joi.allow(true),
      then: Joi.allow(null),
    }),
  valueType: Joi.when("type", {
    is: "enum",
    then: fieldType,
    otherwise: Joi.forbidden(),
  }),
  nodeType: Joi.when("type", {
    is: Joi.any().valid("node", "nodeList"),
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  values: Joi.when("type", {
    is: "enum",
    then: Joi.array().min(1).unique().items(Joi.string()),
    otherwise: Joi.forbidden(),
  }),
  nullable: Joi.boolean(),
});

var schemaSchema = Joi.object().keys({
  name: Joi.string().required(),
  version: Joi.number().integer().greater(0).required(),
  nodeTypes: Joi.array()
    .required()
    .items(
      Joi.object().keys({
        type: Joi.string().required(),
        id: Joi.number().integer().greater(0).required(),
        fields: Joi.array().required().items(fieldSpec),
        extends: Joi.string().required().allow(null),
      })
    ),
});

function lintSchema(schema) {
  var result = Joi.validate(schema, schemaSchema, { abortEarly: false });

  if (result.error) return formatJoiErrorDetails(result.error);
  return validateNodeTypesUnique(schema);
}

function formatJoiErrorDetails(error) {
  return error.details.map(function (details) {
    return details.message + " at " + details.path;
  });
}

function validateNodeTypesUnique(schema) {
  var nodeTypesById = {};
  schema.nodeTypes.forEach(function (nodeType) {
    var id = nodeType.id;
    nodeTypesById[id] = nodeTypesById[id] || [];
    nodeTypesById[id].push(nodeType.name);
  });

  var dups = Object.keys(nodeTypesById).filter(function (id) {
    return nodeTypesById[id].length > 1;
  });

  var errors = [];

  if (dups.length > 0) {
    dups.forEach(function (dupId) {
      var typeNames = nodeTypesById[dupId].join(", ");
      errors.push(
        "duplicate node type IDs for types [" +
          typeNames +
          "] (id = " +
          dupId +
          ")"
      );
    });
  }

  return errors;
}
