var util = require("util");
var setOptionsWithDefaults = require("./options");

module.exports = encode;

var defaultOptions = {
  omitDefaults: true,
};

function encode(roots, schema, options) {
  var encoder = new QueryPackEncoder(schema);
  setOptionsWithDefaults(encoder, options, defaultOptions);

  return encoder.encode(roots);
}

function QueryPackEncoder(schema) {
  var encoder = this;

  this.schema = schema;
  this.firstTimestamp = null;
  this.strings = Object.create(null);
  this.nextStringIdx = 0;
  this.typesByName = {};
  this.omitDefaults = false;

  schema.nodeTypes.forEach(function (nodeType) {
    encoder.typesByName[nodeType.type.toString()] = nodeType;
  });
}

QueryPackEncoder.prototype.encodeString = function (fieldSpec, str) {
  if (typeof str !== "string")
    throw new Error("Attempt to encode non-string value as string");
  if (this.omitDefaults && str === fieldSpec.defaultValue) return "";

  if (Object.prototype.hasOwnProperty.call(this.strings, str)) {
    return this.encodeInt(fieldSpec, this.strings[str]);
  } else {
    this.strings[str] = this.nextStringIdx++;
    return "'" + this.escapeString(str);
  }
};

QueryPackEncoder.prototype.escapeString = function (str) {
  return str.replace(/([,\\;])/g, "\\$1");
};

QueryPackEncoder.prototype.encodeTimestamp = function (fieldSpec, val) {
  if (typeof val !== "number")
    throw new Error("Attempt to encode non-numeric value as timestamp");

  var adjusted = val;

  if (typeof this.firstTimestamp !== "number") {
    this.firstTimestamp = val;
  } else {
    if (fieldSpec.relative === "first") {
      adjusted -= this.firstTimestamp;
    } else if (fieldSpec.relative === "previous") {
      adjusted -= this.lastTimestamp;
    }
  }

  this.lastTimestamp = val;

  if (adjusted === 0) return "";

  return this.encodeInt(fieldSpec, adjusted);
};

QueryPackEncoder.prototype.encodeInt = function (fieldSpec, val) {
  if (typeof val !== "number")
    throw new Error(
      "Attempt to encode non-numeric value '" +
        util.format(val) +
        "' as integer in field '" +
        fieldSpec.name +
        "'"
    );
  if (this.omitDefaults && val === fieldSpec.defaultValue) return "";
  return Math.floor(val).toString(36);
};

QueryPackEncoder.prototype.encodeDouble = function (fieldSpec, val) {
  if (typeof val !== "number")
    throw new Error(
      "Attempt to encode non-numeric value '" +
        util.format(val) +
        "' as double in field '" +
        fieldSpec.name +
        "'"
    );
  if (this.omitDefaults && val === fieldSpec.defaultValue) return "";
  return "" + val;
};

QueryPackEncoder.prototype.encodeBoolean = function (fieldSpec, val) {
  if (typeof val !== "boolean")
    throw new Error(
      "Attempt to encode non-boolean value '" +
        util.format(val) +
        "' as boolean in field '" +
        fieldSpec.name +
        "'"
    );
  if (this.omitDefaults && val === fieldSpec.defaultValue) return "";
  return val ? "T" : "F";
};

QueryPackEncoder.prototype.encodeNodeList = function (fieldSpec, val) {
  var encoder = this;
  if (!Array.isArray(val))
    throw new Error(
      "Attempt to encode non-array value '" +
        util.format(val) +
        "' as nodeList for field '" +
        fieldSpec.name +
        "'"
    );

  val.forEach(function (node) {
    encoder.children.push(node);
  });

  return this.encodeInt({ defaultValue: 0 }, val.length);
};

QueryPackEncoder.prototype.encodeEnum = function encodeEnum(
  fieldSpec,
  fieldVal
) {
  var index = fieldSpec.values.indexOf(fieldVal);
  if (index === -1)
    throw new Error(
      "Unknown value ''" + fieldVal + "'for field '" + fieldSpec.name
    );
  if (fieldVal === fieldSpec.defaultValue) return "";
  return this.encodeInt(fieldSpec, index);
};

QueryPackEncoder.prototype.encodeNode = function encodeNode(n) {
  if (n === null) return "";
  var encoder = this;
  var siblings = this.children;
  this.children = [];
  var node = "";
  var type = this.typesByName[n.type];
  if (!type) {
    throw new Error("Unrecognized type '" + n.type + "' in input JSON");
  }

  var typeId = this.typesByName[n.type].id;

  var typeIdSpec = {
    name: "typeId",
    type: "integer",
  };

  node += this.encodeInt(typeIdSpec, typeId) + ",";

  var fields = this.getAllFields(type);

  for (var fieldIdx = 0; fieldIdx < fields.length; fieldIdx++) {
    var fieldSpec = fields[fieldIdx];
    node += this.encodeValue(fieldSpec, n, fieldIdx < fields.length - 1);
  }

  this.children.forEach(function (child) {
    node += ";" + encoder.encodeNode(child);
  });

  this.children = siblings;

  return node;
};

QueryPackEncoder.prototype.encode = function (roots) {
  var encoder = this;

  var schemaId = encoder.schema.name + "." + encoder.schema.version + ";";

  return (
    schemaId +
    roots
      .map(function (node) {
        return encoder.encodeNode(node);
      })
      .join(";")
  );
};

QueryPackEncoder.prototype.encodeValue = function encodeValue(
  fieldSpec,
  node,
  addSeperator
) {
  var fieldName = fieldSpec.name;
  var fieldVal = node[fieldName];
  var fieldType = fieldSpec.type;

  if (fieldType === "node") {
    if (fieldVal !== null && fieldVal.type !== fieldSpec.nodeType) {
      throw new Error(
        "Expected node of type '" +
          fieldSpec.nodeType +
          "' saw '" +
          fieldVal.type +
          "' for field '" +
          fieldName +
          "'"
      );
    }
    this.children.push(fieldVal);
    return "";
  }

  if (fieldVal === null) {
    if (!fieldSpec.nullable) {
      throw new Error(
        "Saw null value for non-nullable field '" + fieldName + "'"
      );
    }

    if (fieldType === "timestamp" && fieldSpec.relative === "first") {
      // ensure that lastTimestamp is correct for timestamps relative to this timestamp
      this.lastTimestamp = this.firstTimestamp;
    }

    return "!";
  }

  var method = {
    string: "encodeString",
    integer: "encodeInt",
    timestamp: "encodeTimestamp",
    double: "encodeDouble",
    boolean: "encodeBoolean",
    nodeList: "encodeNodeList",
    enum: "encodeEnum",
  }[fieldType];

  if (!method)
    throw new Error(
      "Unknown field type '" + fieldType + "' in node " + util.format(node)
    );

  var encodedVal = this[method](fieldSpec, fieldVal);

  if (addSeperator) {
    encodedVal += ",";
  }

  return encodedVal;
};

QueryPackEncoder.prototype.getAllFields = function getAllFields(type) {
  if (!type.extends) return type.fields;
  return this.getAllFields(this.typesByName[type.extends]).concat(type.fields);
};
