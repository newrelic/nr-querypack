QuerypackText
  = schema:SchemaIdentifier
    NodeSeparator
    nodes:NodeList
    { return { schema: schema, nodes: nodes }; }

SchemaIdentifier
  = name:Letter+ "." version:VersionNumber
    { return { name: name.join(''), version: version } }

VersionNumber
  = first:Digit1_9 rest:Digit0_9*
    { return parseInt(first + rest.join('')) }

FieldSeparator = ","
NodeSeparator = ";"

NodeList
  = head:NodeWithSeparator*
    tail:Node?
    { return tail ? head.concat([tail]) : head }

NodeWithSeparator
  = NullNode
    / (node:Node NodeSeparator { return node })

Node
  = NullNode
    / type:Base36Integer
      FieldSeparator
      fields:FieldList
      { return { typeId: type, fields: fields } }

NullNode
  = NodeSeparator { return null }

FieldList
  = head:FieldWithSeparator*
    tail:(NullField / FieldValue)
    { return head.concat([tail]) }

FieldWithSeparator
  = NullField
    / value:FieldValue FieldSeparator { return value }

FieldValue
  = Boolean / Double / Base36Integer / String / Empty

NullField
  = "!" { return null }

Empty
  = "" { return void 0 }

Base36Integer
  = Minus? Base36Digits { return parseInt(text(), 36) }

Base36Digits
  = Zero / (Digit1_z Digit0_z*)

Double
  = Minus? Digit0_9* Decimal Digit0_9* { return parseFloat(text(), 10) }

Boolean
  = "T" { return true }
    / "F" { return false }

String "string"
  = Quote chars:Char*
    { return chars.join("") }

Char
  = Unescaped / Escape sequence:( "," / "\\" / ";" )
    { return sequence }

Escape         = "\\"
Quote          = "'"

/*
 * Skipping the following:
 * \x2c = ","
 * \x3b = ";"
 * \x5c = "\"
 */
Unescaped      = [\x00-\x2b\x2d-\x3a\x3c-\x5b\x5d-\u10ffff]

Letter        = [a-z]
Digit1_9      = [1-9]
Digit0_9      = [0-9]
Digit1_z      = [1-9a-z]
Digit0_z      = [0-9a-z]

Minus         = "-"
Zero          = "0"
Decimal       = "."
