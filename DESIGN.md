# Design of the querypack format

### Why querypack?

The goals of querypack:

1. Be **compact** when embedded in the query string of a URL
2. Be **efficient to produce** from browser-hosted JS
3. Be **flexible** enough to represent all data sent by the JS agent

We evaluated several strategies to accomplish these goals:

| goal      | querypack | json | GZIP |
|-----------|-----------|------|------|
| compact   | yes       | X(*) | yes  |
| efficient | yes       | yes  | X(**)|
| flexible  | yes       | yes  | yes  |

(\*) JSON is not compact when transmitted in the query string because of the character escaping required to represent JSON meta-characters, in addition to the quoting and repetition of key names.
(**) GZIP has a high runtime cost of compression.

### General approach
The querypack string consists of a list of nodes separated by semicolons. Each node represents either a common function (xhr, timer, fetch, etc) or meta data about the interaction (custom attribute, api call, etc). A node is a comma separated list of fields with whose type is identified by a unique id number defined in the schema. Function nodes may spawn other function nodes, and their relationship is encoded as parent/child. Meta data nodes cannot spawn additional nodes.

### Schema
The schema version is encoded in the sequence of characters up to the first semi-colon (ie: `bel.2;`), and field definitions can be found in the `schemas/` directory.

### Fields
Each node type has a static number of fields. Each field has a `name`, `type`, and `defaultValue` attribute. Timestamps are encoded relative to another timestamp, and have an additional `relative` attribute whose value is either `previous` (relative to the last timestamp encoded), or `first` (relative to the navigation start timestamp).

See the `examples/` directory for example encoded and decoded querypacks.
