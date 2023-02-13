var util = require('util')
var schemas = require('../schemas/all.json')
var parser = require('./parser/querypack.js')
var setOptionsWithDefaults = require('./options')

module.exports = decode

var defaultOptions = {
  strict: false,
  decodeDates: false
}

function decode (input, options) {
  var decoder = new QueryPackDecoder()
  setOptionsWithDefaults(decoder, options, defaultOptions)
  return decoder.decode(input)
}

function QueryPackDecoder () {
  this.cursor = 0
  this.strings = []
  this.strict = false
  this.decodeDates = false
  this.typesById = {}
  this.typesByName = {}
}

QueryPackDecoder.prototype.decode = function (input) {
  var decoder = this
  var result = parser.parse(input)

  var schemaId = result.schema.name + '.' + result.schema.version
  var schema = schemas[schemaId]

  for (var i = 0; i < schema.nodeTypes.length; i++) {
    var nodeType = schema.nodeTypes[i]
    decoder.typesById[nodeType.id.toString()] = nodeType
    decoder.typesByName[nodeType.type] = nodeType
  }

  this.schema = schema
  this.nodes = result.nodes

  var decodedNodes = []

  for (i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i]
    decodedNodes.push(decoder.decodeNode(node))
  }

  var nodeIdx = 0
  var roots = []

  while (nodeIdx < decodedNodes.length) {
    roots.push(treeify())
  }

  return roots

  function treeify () {
    var node = decodedNodes[nodeIdx++]

    if (!node) {
      return null
    }

    node.childNodes.forEach(function (child) {
      var childNode = treeify()

      if (childNode === null) {
        if (!child.fieldSpec.nullable) {
          throw new Error(
            "Saw null node for non nullable field '" +
              child.fieldSpec.name +
              "'"
          )
        }
      } else if (child.expectedType && childNode.type !== child.expectedType) {
        throw new Error(
          "Invalid node for field '" +
            child.fieldSpec.name +
            "' saw '" +
            childNode.type +
            "' expected '" +
            child.expectedType +
            "'"
        )
      }

      child.target[child.prop] = childNode
    })

    delete node['childNodes']
    return node
  }
}

QueryPackDecoder.prototype.remaining = function () {
  return this.entries.length - this.cursor
}

QueryPackDecoder.prototype.empty = function () {
  return this.cursor === this.entries.length
}

QueryPackDecoder.prototype.decodeNode = function (node) {
  if (node === null) return null

  var decoder = this
  var decodedNode = {}
  var typeId = node.typeId
  var typeSchema = this.typesById[typeId.toString()]
  var fields = this.getAllFields(typeSchema)
  var fieldCount = fields.length
  var fieldsUsed = 0

  if (!typeSchema) throw new Error('Unrecognized type ID: ' + typeId)

  decodedNode.type = typeSchema.type
  decodedNode.childNodes = []

  for (var fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
    var fieldSpec = fields[fieldIdx]

    if (!fieldSpec) {
      if (this.strict) {
        throw new Error(
          'Too many (' +
            (fieldCount + 1) +
            ") fields for node type '" +
            typeSchema.type +
            "'"
        )
      } else {
        continue
      }
    }

    var fieldName = fieldSpec.name
    var fieldType = fieldSpec.type

    if (fieldType === 'node') {
      decodeNodeField(fieldSpec, fieldVal)
      continue
    }

    var fieldVal = node.fields[fieldsUsed++]

    if (fieldVal === null) {
      if (!fieldSpec.nullable) {
        throw new Error(
          "Missing required field '" +
            fieldName +
            "' for node type '" +
            typeSchema.type +
            "'"
        )
      }

      if (fieldType === 'timestamp' && fieldSpec.relative === 'first') {
        // ensure that lastTimestamp is correct for timestamps relative to this timestamp
        decoder.lastTimestamp = decoder.firstTimestamp
      }

      decodedNode[fieldName] = null
      continue
    }

    switch (fieldType) {
      case 'string':
        fieldVal = decodeString(fieldSpec, fieldVal)
        break

      case 'timestamp':
        fieldVal = decodeTimestamp(fieldSpec, fieldVal)
        break

      case 'integer':
        fieldVal = decodeInteger(fieldSpec, fieldVal)
        break

      case 'double':
        fieldVal = decodeDouble(fieldSpec, fieldVal)
        break

      case 'boolean':
        fieldVal = decodeBoolean(fieldSpec, fieldVal)
        break

      case 'nodeList':
        fieldVal = decodeNodeList(fieldSpec, fieldVal)
        break

      case 'enum':
        fieldVal = decodeEnum(fieldSpec, fieldVal)
        break

      default:
        throw new Error(
          "Unrecognized field type '" +
            fieldType +
            "' in type '" +
            util.format(typeSchema) +
            "'"
        )
    }

    decodedNode[fieldName] = fieldVal
  }

  return decodedNode

  function decodeString (fieldSpec, rawVal) {
    var val = rawVal
    if (val === void 0) val = fieldSpec.defaultValue

    if (typeof val === 'number') {
      val = decoder.strings[val]
      if (typeof val !== 'string') {
        throw new Error('Bad string reference: ' + rawVal)
      }
    } else if (rawVal !== void 0 && rawVal !== null) {
      decoder.strings.push(val)
    }
    return val
  }

  function decodeTimestamp (fieldSpec, val) {
    if (val === void 0) val = 0

    if (fieldSpec.relative === 'first') {
      if (typeof decoder.firstTimestamp !== 'number') {
        decoder.firstTimestamp = val
      } else {
        val += decoder.firstTimestamp
      }
    } else if (fieldSpec.relative === 'previous') {
      val += decoder.lastTimestamp || 0
    }

    decoder.lastTimestamp = val

    if (decoder.decodeDates) {
      return val - decoder.firstTimestamp
    } else {
      return val
    }
  }

  function decodeInteger (fieldSpec, val) {
    if (val === void 0) return fieldSpec.defaultValue
    return val
  }

  function decodeDouble (fieldSpec, val) {
    if (val === void 0) return fieldSpec.defaultValue
    return val
  }

  function decodeBoolean (fieldSpec, val) {
    if (val === void 0) return fieldSpec.defaultValue
    return val
  }

  function decodeNodeList (fieldSpec, val) {
    var length = decodeInteger({ defaultValue: 0 }, val)
    var list = new Array(length)

    for (var i = 0; i < length; ++i) {
      decodedNode.childNodes.push({
        target: list,
        prop: i,
        fieldSpec: fieldSpec
      })
    }

    return list
  }

  function decodeNodeField (fieldSpec) {
    decodedNode.childNodes.push({
      target: decodedNode,
      prop: fieldSpec.name,
      fieldSpec: fieldSpec,
      expectedType: fieldSpec.nodeType
    })
    return null
  }

  function decodeEnum (fieldSpec, val) {
    if (val === void 0) {
      return fieldSpec.defaultValue
    }
    var index = decodeInteger(fieldSpec, fieldVal)
    if (index < 0 || index >= fieldSpec.values.length) {
      throw new Error(
        "Index out of bounds for enum '" +
          fieldName +
          "' in type '" +
          util.format(typeSchema) +
          "'"
      )
    }

    return fieldSpec.values[index]
  }
}

QueryPackDecoder.prototype.getAllFields = function getAllFields (type) {
  if (!type.extends) return type.fields
  return this.getAllFields(this.typesByName[type.extends]).concat(type.fields)
}
