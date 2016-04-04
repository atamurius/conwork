function guid() {
  let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

window.NodesModule = {
	actions: {
		changeValue: (id, value) => ({
		    type: 'CHANGE_NODE_VALUE',
		    id: id, 
		    value: value
		}),
		insertAfter: (parent, id) => ({
		    type: 'INSERT_NODE_AFTER',
		    parent: parent, 
		    after: id,
		    id: guid()
		}),
		removeNode: (id) => ({
		    type: 'REMOVE_NODE',
		    id: id
		})
	},
	reducer: (state, action) => {
		switch (action.type) {

	        case 'CHANGE_NODE_VALUE':
	            return iUpdate(state, {nodes: 
	                updateNodeById(state.nodes, action.id, 
	                    node => iUpdate(node, {value: action.value})
	                )
	            })

	        case 'INSERT_NODE_AFTER':
	            if (action.parent === null) {
	                return iUpdate(state, {nodes: insertNewAfter(state.nodes, action)})
	            }
	            else {
	                return iUpdate(state, {nodes: 
	                    updateNodeById(state.nodes, action.parent,
	                        node => iUpdate(node, {content: insertNewAfter(node.content, action)})
	                    )
	                })
	            }

	        case 'REMOVE_NODE':
	            return iUpdate(state, {nodes: 
	                updateNodeById(state.nodes, action.id, 
	                    node => null
	                )
	            })

	        default:
	            return state
	    }
	}
}

function insertNewAfter(nodes, {after,id}) {
    var pos = (after === null) ? 0 : -1
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === after) {
            pos = i + 1
        }
        if (nodes[i].id === id)
            return nodes;
    }
    if (pos === -1) pos = nodes.length
    return iInsert(nodes, pos, { id, value: '', content: [] })
}

function updateNodeById(nodes, id, change) {
    var changed = false
    let updated = nodes.map(node => {
        if (node.id === id) {
            changed = true;
            return change(node);
        }
        else {
            let updatedContent = updateNodeById(node.content, id, change)
            if (updatedContent == node.content) {
                return node
            }
            else {
                changed = true
                return iUpdate(node, {content: updatedContent})
            }
        }
    }).filter(n => n !== null)
    return changed ? updated : nodes
}