module.exports = setOptionsWithDefaults

function setOptionsWithDefaults (target, options, defaultOptions) {
  for (const key in defaultOptions) {
    if (options && Object.hasOwnProperty.call(options, key)) {
      target[key] = options[key]
    } else {
      target[key] = defaultOptions[key]
    }
  }
}
