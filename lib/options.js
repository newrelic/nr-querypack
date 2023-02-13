module.exports = setOptionsWithDefaults

function setOptionsWithDefaults (target, options, defaultOptions) {
  for (var key in defaultOptions) {
    if (options && Object.prototype.hasOwnProperty.call(options, key)) {
      target[key] = options[key]
    } else {
      target[key] = defaultOptions[key]
    }
  }
}
