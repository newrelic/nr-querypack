# Contributing

Contributions are always welcome. Before contributing please read the
[code of conduct](https://github.com/newrelic/.github/blob/main/CODE_OF_CONDUCT.md) and [search the issue tracker](issues); your issue may have already been discussed or fixed in `main`. To contribute,
[fork](https://help.github.com/articles/fork-a-repo/) this repository, commit your changes, and [send a Pull Request](https://help.github.com/articles/using-pull-requests/).

Note that our [code of conduct](https://github.com/newrelic/.github/blob/main/CODE_OF_CONDUCT.md) applies to all platforms and venues related to this project; please follow it in all your interactions with the project and its participants.

## Feature Requests

Feature requests should be submitted in the [Issue tracker](../../issues), with a description of the expected behavior & use case, where they’ll remain closed until sufficient interest, [e.g. :+1: reactions](https://help.github.com/articles/about-discussions-in-issues-and-pull-requests/), has been [shown by the community](../../issues?q=label%3A%22votes+needed%22+sort%3Areactions-%2B1-desc).
Before submitting an Issue, please search for similar ones in the
[closed issues](../../issues?q=is%3Aissue+is%3Aclosed+label%3Aenhancement).

## Pull Requests

If you’re planning on contributing a new feature or an otherwise complex contribution, we kindly ask you to start a conversation with the maintainer team by opening up a Github issue first.

### General Guidelines

This project is licensed under the Apache-2.0 license. Any third party libraries added as dependencies of the project must have a similarly permissive open source license, e.g. MIT.

### Coding Style Guidelines/Conventions

We use eslint to enforce certain coding standards. Please see our .eslintrc file for specific rule configuration.

### Testing Guidelines

If you want to introduce a change to the schema used by the [New Relic Browser Agent](https://github.com/newrelic/newrelic-browser-agent), then create a new version of the [bel](https://github.com/newrelic/nr-querypack/schemas/bel) schema as described [here](https://github.com/newrelic/nr-querypack#adding-a-new-version).

New schema versions must be accompanied by corresponding tests. This is done by adding files in the [examples](https://github.com/newrelic/nr-querypack/tree/main/examples) folder that represent test cases for encoding and decoding. Running `npm test` will automatically include all test cases in this folder.

## Contributor License Agreement

Keep in mind that when you submit your Pull Request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.

For more information about CLAs, please check out Alex Russell’s excellent post,
[“Why Do I Need to Sign This?”](https://infrequently.org/2008/06/why-do-i-need-to-sign-this/).

## Slack

We host a public Slack with a dedicated channel for contributors and maintainers of open source projects hosted by New Relic. If you are contributing to this project, you're welcome to request access to the #oss-contributors channel in the newrelicusers.slack.com workspace. To request access, see https://newrelicusers-signup.herokuapp.com/.
