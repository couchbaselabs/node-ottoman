# Couchbase ODM JSON (COO)

### Strong types encoded as:

```
{
  "_type": "Account",
  ...
}
```

### References encoded as:

References include the type of the document to permit the decoder to early-bind the reference-type to the correct object type.

```
{
  "_type": "DOCUMENT_TYPE",
  "$ref": "DOCUMENT_KEY"
}
```

### Mixed-type dates encoded as:

##### Mixed Typed:

```
{
  "_type":"Date",
  "v": "2007-03-01T13:00:00Z"
}
```

##### Strongly Typed:

`"2007-03-01T13:00:00Z"`

### Map encoded as:

```javascript
{
  "_type": "Map",
  ...
}
```

### List encoded as:

`[...]`

### Strings encoded as:

`"..."`

### Numbers encoded as:

`...`



# Model Definition:
## Examples
Basic Example:

```
ottoman.model({
  name: "string"
})
```

Grouping Properties:

```
ottoman.model({
  user: {
    name: "string"
  },
  company: "string"
})
```

## Model Def Properties
- .id
- .forceTyping
- 

## Field Def Properties
- .name
- .type
- .default
- .validator
- .readonly
- .auto


# Notes
- Schema's must be defined before being embedded.
- Referenced Schema's can be used before being declared.
- id's cannot reference into a referenced Schema.
- Embedded properties can be nulled.
- Anonymous embedded schemas cannot be nulled (since you could never create them again).
- Schema's cannot cross context boundaries.
- Schema types are compared by-name and by-context.
- Model's are the [Function] constructors.  Scheme's are the data layout.
- Validations are defined with the type (not separate).
- Pre/Post Events for Serialize/Deserialize/Validate,Save


# Questions
1. How do we deal with referenced objects that want to be loaded.



# Types
## ModelData:


## ModelInstanceData:
- .parent ModelData


## Model:
- .$ ModelData
- .forceTyping bool (default: false)
- .ref(id) ModelInstance
- .findById(id) ModelInstance


## ModelInstance:
- .$ ModelInstanceData
- .id() string
- .loaded() bool
- .load(callback) -
- .save(callback) -
- *special
  - .inspect() string
  - .toJSON() Object
