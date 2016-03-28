
// Copy on write
window.iUpdate = function(obj, props) {
    var changed = false
    for (let p in props) 
        if (props[p] !== obj[p]) {
            changed = true
            break
        }
    if (! changed) return obj
	let copy = {}
	for (let p in obj) copy[p] = obj[p]
	for (let p in props) copy[p] = props[p]
	return copy
}

window.iInsert = function(array, i, elem) {
	return array.slice(0,i).concat([ elem ]).concat(array.slice(i))
}

window.iMerge = function(objs) {
	return objs.reduce(window.iUpdate)
}