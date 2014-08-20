# Rework @media filter

Plugin for rework that allows you to remove media queries that don't match some criteria. 

You can provide a function that gets given all @media blocks. It can then decide whether to remove the @media block entirely, flatten the @media block  (move its contents up into global scope), replace the selector used for the @media block, or leave it untouched.

Return 
* `undefined` to leave the @media untouched
* `false` to remove the @media block
* `true` to flatten the @media block
* a `string` to replace the existing @media criteria selector

The predicate function is given two arguments, one 

Eg.

```
var filter = mediaFilter({
    
})


// dependencies
var fs = require('fs');
var rework = require('rework');
var mediaFilter = require('rework-custom-media');

// css to be processed
var css = fs.readFileSync('build/build.css', 'utf8').toString();

// process css using rework-custom-media
css = rework(css).use(mediaFilter(function(mediaRule, props){
    // return undefined
    var minWidth = parseInt(props.minWidth, 10)
    var maxWidth = parseInt(props.maxWidth, 10)

    if (minWidth){
        if (minWidth > 1000){
            return true // flatten
        }
        return false // remove
    }

    if (maxWidth){
        return false // remove
    }

    return // leave untouched. maybe it's a retina thing
})).toString();






```

