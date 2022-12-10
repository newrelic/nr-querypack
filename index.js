const schemas = require('./lib/schemas')
const examples = require('./lib/examples')
const encode = require('./lib/encoder')
const decode = require('./lib/decoder')

module.exports = {
  encode,
  decode,
  schemas,
  examples
}
