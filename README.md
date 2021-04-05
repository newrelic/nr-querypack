[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# nr-querypack

querypack is a serialization format designed for use by the New Relic Browser Agent.

This repository also contains a reference encoder and decoder (`qputil`) to produce querypack from JSON, and to decode querypack to JSON. It also contains querypack schemas and test-cases meant to be consumed by other parser / encoder implementations. The schema used by the Browser Agent is called `bel`, and it is currently used to serialize information about single-page app route changes.

For details about the design of the querypack format, see [DESIGN.md](DESIGN.md).

## Installation

```
$ git clone https://github.com/newrelic/nr-querypack.git
$ cd nr-querypack
$ npm install
```

## Getting Started

The schema used by the Browser Agent is defined in the [schemas/bel](schemas/bel) directory.

To encode a JSON message, use the following command:

```
node bin/qputil.js encode <filename>.json schemas/bel/7.qpschema
```

To decode a message from querypack to JSON, use the following command:

```
node bin/qputil.js decode <filename>.querypack
```

## Usage

```
$ bin/qputil.js encode <filename>.json schemas/<schemaName>.qpschema
$ bin/qputil.js decode <filename>.querypack
$ bin/qputil.js validate <filename>.querypack schemas/<schemaName>.qpschema
```

If you have it in your clipboard, you can use it like this:

```
pbpaste | tr -d '[:space:]' | bin/qputil.js decode - | less
```

### Adding new bel schema version
Sometimes when developing a new feature, the structure of the serialized data the Browser Agent sends needs to change.
To do this, follow the example structure below, to create files with an updated version of the schema:

* examples/bel/CURRENT_VERSION/*
* schema/bel/CURRENT_VERSION.qpschema

Any changes to the bel schema should require a new version bump.

This version bump is not a breaking change because each version lives in a separate file, but will require an update to the agent to encode the new format and the data processing pipeline to decode using the new format.

## Testing

Compile & run test cases, schemas, grammar and parser for QueryPack:

```
$ npm test
```

## Support

For issues related to querypack, please feel free to either open a [GitHub issue in this repository](https://github.com/newrelic/nr-querypack/issues) or see our [support thread in the New Relic Community](TBD).

Should you need assistance with New Relic products, you are in good hands with several support channels.

* [New Relic Documentation](https://docs.newrelic.com/docs/browser/browser-monitoring/getting-started/introduction-browser-monitoring/): Comprehensive guidance for using our platform
* [New Relic Community](https://discuss.newrelic.com/tag/browser/): The best place to engage in troubleshooting questions
* [New Relic Developer](https://developer.newrelic.com/): Resources for building a custom observability applications
* [New Relic University](https://learn.newrelic.com/): A range of online training for New Relic users of every level
* [New Relic Technical Support](https://support.newrelic.com/) 24/7/365 ticketed support. Read more about our [Technical Support Offerings](https://docs.newrelic.com/docs/licenses/license-information/general-usage-licenses/support-plan).

## Contribute

We encourage your contributions to improve nr-querypack! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

To all contributors, we thank you!  Without your contribution, this project would not be what it is today.  We also host a community project page dedicated to nr-querypack(https://github.com/newrelic/nr-querypack).

## License
The nr-querypack project is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
The nr-querypack project also uses source code from third-party libraries. You can find full details on which libraries are used and the terms under which they are licensed in the third-party notices document.]


