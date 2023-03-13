var schemas = require('./lib/schemas')
var examples = require('./lib/examples')
var encode = require('./lib/encoder')
var decode = require('./lib/decoder')

module.exports = {
  encode: encode,
  decode: decode,
  schemas: schemas,
  examples: examples
}
