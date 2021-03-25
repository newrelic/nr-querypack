[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# [nr-querypack] [build badges go here when available]

>[Brief description - what is the project and value does it provide? How often should users expect to get releases? How is versioning set up? Where does this project want to go?]

querypack is a serialization format designed for use by the New Relic Browser Agent. It's currently used to serialize information about single-page app route changes.

This repository contains a reference encoder and decoder (`qputil`) to produce querypack from JSON, and to decode querypack to JSON. It also contains querypack schemas and test-cases meant to be consumed by other parser / encoder implementations.

For details about the design of the querypack format, see [DESIGN.md](DESIGN.md).

## Installation

```
$ git clone https://github.com/newrelic/nr-querypack.git
$ cd nr-querypack
$ npm install
```

## Getting Started
>[Simple steps to start working with the software similar to a "Hello World"]

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

### Adding a new version

Any grouped changes to the querypack schema should require a new version bump.

To add a new version, you need to copy these:

* examples/bel/CURRENT_VERSION/*
* schema/bel/CURRENT_VERSION.qpschema

## Testing

Compile & run test cases, schemas, grammar and parser for QueryPack:

```
$ npm test
```

## Support

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

>Add the url for the support thread here: discuss.newrelic.com

## Contribute

We encourage your contributions to improve [project name]! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

To all contributors, we thank you!  Without your contribution, this project would not be what it is today.  We also host a community project page dedicated to [Project Name](<LINK TO https://opensource.newrelic.com/projects/... PAGE>).

## License
[Project Name] is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
>[If applicable: The [project name] also uses source code from third-party libraries. You can find full details on which libraries are used and the terms under which they are licensed in the third-party notices document.]


