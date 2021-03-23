# nr-querypack

querypack is a serialization format designed for use by the New Relic Browser Agent with three goals in mind:

1. Be **compact** when embedded in the query string of a URL
2. Be **efficient to produce** from browser-hosted JS
3. Be **flexible** enough to represent all data sent by the JS agent

It's currently used to serialize information about single-page app route changes, and may be used to serialize other kinds of data from the Browser Agent in the future.

This repository contains a reference encoder and decoder (`qputil`) to produce querypack from JSON, and to decode querypack to JSON. It also contains querypack schemas and test-cases meant to be consumed by other parser / encoder implementations.

For details about the design of the querypack format, see [DESIGN.md](DESIGN.md).

## Installation

```
$ git clone https://github.com/newrelic/nr-querypack.git
$ cd nr-querypack
$ npm install
```

### Usage

```
$ bin/qputil.js encode <filename>.json schemas/<schemaName>.qpschema
$ bin/qputil.js decode <filename>.querypack
$ bin/qputil.js validate <filename>.querypack schemas/<schemaName>.qpschema
```

If you have it in your clipboard, you can use it like this:

```
pbpaste | tr -d '[:space:]' | bin/qputil.js decode - | less
```

## Testing

Compile & run test cases, schemas, grammar and parser for QueryPack:

```
$ npm test
```

## Adding a new version

Any grouped changes to the querypack schema should require a new version bump.

To add a new version, you need to copy these:

* examples/bel/CURRENT_VERSION/*
* schema/bel/CURRENT_VERSION.qpschema
