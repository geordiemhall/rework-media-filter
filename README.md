# Rework @media filter

Plugin for rework that allows you to remove media queries that don't match some criteria. 

You can provide a predicate function that gets given all @media blocks. You can then decide whether to remove the @media block entirely, flatten the @media block  (move its contents up into global scope), replace the selector used for the @media block, or leave it untouched.

The predicate gets passed two arguments: `predicate(mediaRule, props)`.
    * `mediaRule` is the standard ast node from Rework, in case you need it for anything
    * `props` is an object with the key/value pairs in the rule, which you can use to check values against your own logic
        * Eg. @media (min-width: 800px) and (max-width: 1000px) will have a `props` object like `{ 'min-width': '800px', 'max-width': '1000px' }`
        * NOTE: Only very basic parsing is performed on the rule, and it only expects one level of bracket nesting. Complex rules will have unexpected results, but you can always parse them yourself manually using the `mediaRule` object

The return value of the predicate will determine how the @media rule is handled. Return 

* `undefined` to leave the @media block untouched
* `false` to remove the @media block
* `true` to flatten the @media block
* a `string` to replace the existing @media criteria selector. Note, this should include the brackets since it's essentially everything that comes after the @media part

Eg.

```
var reworkMediaFilter = require('rework-media-filter')

var myFilter = reworkMediaFilter(function(rule, props){
    // flatten if there's a min-width
    if (props['min-width']){
        return true
    }

    // remove if there's a max-width less than 600px
    if (parseInt(props['max-width'], 10) < 600){
        return false
    }

    // replace with some custom value
    if (props['pixel-ratio']){
        return '(my-custom-value: 600px)'
    }

    // return undefined for no action
})

```


There are also some presets provided for common actions. You can access these using the `presets` property on the module.

Eg. 

```
var reworkMediaFilter = require('rework-media-filter')
var myFilter = reworkMediaFilter.presets.minWidth(1200)
```

The current presets are:

### `minWidth(width)`
* minWidth tries to force the page state to be styled as if the window width is at least `width`
    * Removes any media queries that only take effect below `minWidth`
    * Flattens any other media queries that have a min-width, so they're effectively always triggered

### Using with `grunt-rework`

Can be used in conjunction with `grunt-rework`. 

Eg. We want to try to force the window to act like it's at least 1200px wide

```
// Gruntfile.js

var reworkMediaFilter = require('rework-media-filter')

...

    rework: {
        core: {
            files: {
                'dist/styles/core-namespaced.css': 'dist/styles/core.css',
            },
            options: {
                use: [
                    reworkMediaFilter.presets.minWidth(1200),
                ],
            }
        },

```

Which will turn 

```
.menu-always {
    background: green;
}

@media (min-width: 1100px) and (max-width: 2000px){
    .menu-min-and-max {
        background: red;
    }
}

@media (min-width: 600px){
    .menu-min-small {
        color: blue;
    }
}

@media (max-width: 600px){
    .menu-only-small {
        color: purple;
    }
}
```

into

```
.menu-always {
    background: green;
}

.menu-min-and-max {
    background: red;
}

.menu-min-small {
    color: blue;
}

```