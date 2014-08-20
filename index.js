/**
* Util functions
*/

function dashesToCamelCase(str){
  return str.replace(/\-\w/g, function(s){return s.toUpperCase().replace('-', '')})
}

function insertIntoArray(arr, beforeIndex, newElements, numberOfElementsToRemove){
  var args = [beforeIndex, (numberOfElementsToRemove || 0)]

  newElements.forEach(function(d){
    args.push(d)
  })

  Array.prototype.splice.apply(arr, args)
}

// Try to do some basic conversion from a media query property string into an object with properties
// Only designed to handle one level deep of brackets, so complex media queries may be unexpected results
// Eg. propsToObject("(min-width: 1000px) and (max-width: 2000px)") => { 'min-width': '1000px', 'max-width': '2000px' }
// If `convertToCamelCase` is true, then it'll convert the keys to be camel case instead of dasherized
// On large css sets this may be an unexpectd perf hit though, so probably better to just deal with dasherized keys
// Eg. propsToObject("(min-width: 1000px) and (max-width: 2000px)", true) => { minWidth: '1000px', maxWidth: '2000px' }
function propsToObject(str, convertToCamelCase){
  var props = []
  str.replace(/\((.+?)\)/g, function(d){
    var m = d.match(/^\((.*)\)$/)
    var values = (m && m[1]) || ''
    values.split(';').forEach(function(d){
      props.push(d)
    })
    return 
  })

  var obj = {}

  props.forEach(function(d){
    var arr = d.split(':')
    var key = arr[0].trim()
    var val = arr[1].trim()
    if (key && val){
      var realKey = convertToCamelCase ? dashesToCamelCase(key) : key
      obj[realKey] = val
    }
  })

  return obj
}


/**
 * Module export
 */

module.exports = function (predicate){

  return function filterMedia(ast) {
    var rules = ast.rules

    if (ast.type === 'stylesheet'){
      rules = ast.stylesheet.rules
    }

    for (var i = rules.length - 1; i >= 0; i -= 1) {
      var rule = rules[i]

      if (!rule.media){
        continue
      }

      var props = propsToObject(rule.media, false)
      var result = predicate(rule, props)

      // skip @media
      if (result === undefined){
        continue
      }

      // remove @media
      if (result === false){
        rules.splice(i, 1) // remove this element
        continue
      }

      // flatten @media
      if (result === true){
        insertIntoArray(rules, i, rule.rules, 1)
        continue
      }

      // replace @media
      if (typeof result === 'string'){
        rule.media = result
        continue
      }
    }
  }
}


/**
* Presets
*/

module.exports.presets = {
  // minWidth tries to force the page state to be styled as if the window width was at least `width`, with no media queries left
  //    Removes any media queries that only take effect below `minWidth`
  //    Flattens any other media queries that have a min-width, so they're effectively always triggered
  //    By default any media queries with a min-width larger than `width` will be removed, since they wouldn't have been triggered at `width`.
  //    You can set `allowWider` to true to also trigger them
  minWidth: function(width, allowWider){
    var minScreenWidth = width || 1200  // 1200 is bootstrap's default @screen-lg
    
    return module.exports(function(mediaRule, props){
      if (props['max-width']){
        var maxWidth = parseInt(props['max-width'], 10)
        if (maxWidth < minScreenWidth){
          return false // remove
        }
      }

      if (props['min-width']){
        var minWidth = parseInt(props['max-width'], 10)
        if (minWidth > width && !allowWider){
          return false // remove
        }
        return true // flatten
      }

      // no min or max, so probably something like pixel-ratio, leave as is
    })
  }
}
