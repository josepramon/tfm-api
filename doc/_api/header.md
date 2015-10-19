### API responses structure

The API returns all the responses 'wrapped' inside a `data` node.  
All the responses also have a `meta` node with metadata, like the document/collection API endpoint URL, pagination or other information.

Example:

```json
{
  "meta": {
    "url" : "http://the-api-url/whatever"
  },
  "data": {
    "id": 3215465479452108
  }
}
```

When the API returns an error, there's no `data` node. Instead, there's an `error` node with a `code` attribute and a `message`. On validation errors, the API also returns an `errors` node (at the same level of `error`) with information about each validation errors.

Example:

```json
{
  "meta": {},
  "error": {
    "code": 404,
    "message": "Not found"
  }
}
```

Validation error example:

```json
{
  "meta": {},
  "error": {
    "code": 422,
    "message": "Validation Error"
  },
  "errors": {
    "title": [ "`Title` is required." ],
    "date":  [ "`Date` is required.", "`Date` must be whatever." ],
  }
}
```

### Nested relations

Some documents can have 'nested' objects, or relations. The attribute that holds the relation can contain one value, multiple, or none. It depends on the attribute (for example, an `author` attribute should contain one nested object (or none), but a `tags`attribute could contain multiple).

By default, those nested objects are not returned on the API responses. Instead, those appear 'collapsed', as an object with a `meta` attribute with the object/collection API endpoint, and the nested objects count. For example:

`GET http://the-api-url/whatever/3246783468467854`

```json
{
  "meta" : {  },
  "data": {
    "id": 3246783468467854,
    "name": "Some name",
    "someNestedObject": {
      "meta": {
        "url": "http://the-api-url/3246783468467854/someNestedObject",
        "count": 1
      }
    }
  }
}
```

The nested objects can be 'expanded' adding a parameter `include` on the request. For example:

`GET http://the-api-url/whatever/3246783468467854?include=someNestedObject`

```json
{
  "meta" : {  },
  "data": {
    "id": 3246783468467854,
    "name": "Some name",
    "someNestedObject": {
      "meta": {
        "url": "http://the-api-url/3246783468467854/someNestedObject",
        "paginator": {
          "total_entries": 1,
          "total_pages": 1,
          "page": 1,
          "per_page": 20
        }
      }
    },
    "data": {
      "id":       644343213463534432434354,
      "someAttr": "BlahBlahBlah"
    }
  }
}
```

Multiple expansions are allowed using a comma as separator (`...?include=foo,bar`) or passing it as an array(`...?include[]=foo&include[]=bar`).

When expanded, instead of a `count` attribute, a `paginator` object will be returned. All nested relations are always paginated when returned with the parent object using the `include` parameter. See the **Pagination - Nested Pagination** section.


### Pagination

All the API calls that potentially return more than one object are paginated.

The pagination can be controlled using the following querystring parameters:

- `per_page`: Determines the maximum items returned. The API has a default value, and a hard limit that can not be overridden.
- `page`.

Additionally, there's the `sort` parameter. It accepts multiple values (using commas or as an array, see the `include` parameter). It also accepts optionally the sort direction using a pipe as a separator. If the direction is not provided, it defaults to 'asc'. The accepted values for the direction are: `1`, `asc`, `-1` and `desc`.

Examples:

- `...?sort=id`
- `...?sort=id|desc`
- `...?sort=id|desc,name|asc,date`
- `...?sort[]=id&sort[]=name|desc`

The responses will include a `paginator` node inside the `meta`:

```json
{
  "meta" : {
    "paginator": {
      "total_entries": 1,
      "total_pages": 1,
      "page": 1,
      "per_page": 20
    }
  },
  "data": {  }
}
```

With sorting applied:

```json
{
  "meta" : {
    "paginator": {
      "total_entries": 1,
      "total_pages": 1,
      "page": 1,
      "per_page": 20,
      "sort": {
        "title": "desc",
        "publish_date": "asc",
        "id": "asc"
      }
    }
  },
  "data": {  }
}
```


#### Nested Pagination

The pagination options for the nested collections are the same, but the syntax is a little bit different:

`...?include=tags:page(1):per_page(4):sort(id,name|-1)`

Instead of ampersands it uses a colon `:` as separator, and the values go between parentheses.
