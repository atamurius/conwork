
window.Actions = {
    changeValue: (id, value) => ({
        type: 'CHANGE_NODE_VALUE',
        id, value
    }),
    insertAfter: (parent, id) => ({
        type: 'INSERT_NODE_AFTER',
        parent, id
    }),
    removeNode: (id) => ({
        type: 'REMOVE_NODE',
        id
    }),
    nodeAction: (action,state) => ({
        type: 'NODE_ACTION_EXECUTED',
        action, state
    }),
    undo: (n = 0) => ({
        type: 'HISTORY_UNDO', n
    }),
    redo: (n = 0) => ({
        type: 'HISTORY_REDO', n
    })
}

let NODE_ACTIONS = ['CHANGE_NODE_VALUE','INSERT_NODE_AFTER','REMOVE_NODE']

function guid() {
  let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function node(value = '', content = []) {
    return {
        id: guid(),
        value, content
    }
}

/**
 * State structure: list of blocks, each block is:
 * 	- id
 *	- value
 *	- content: list of blocks
 */
window.store = new Store((state, action, dispatch) => (typeof state !== 'undefined') ? state : {
    history: [],
    future: [],
    nodes: []
})

/** Record node action initial state */
window.store.addReducer((state, action, dispatch) => {
    if (NODE_ACTIONS.indexOf(action.type) !== -1) {
        dispatch(Actions.nodeAction(action,state.nodes))
    }
    return state
})

/** Nodes actions */
window.store.addReducer((state, action, dispatch) => {
	switch (action.type) {
        case 'CHANGE_NODE_VALUE':
            return copyIfChanged(state, {nodes: 
                updateNodeById(state.nodes, action.id, 
                    node => copy(node, {value: action.value})
                )
            })
        case 'INSERT_NODE_AFTER':
            if (action.parent === null) {
                return copy(state, {nodes: insertNewAfter(state.nodes, action.id)})
            }
            else {
                return copyIfChanged(state, {nodes: 
                    updateNodeById(state.nodes, action.parent,
                        node => copy(node, {content: insertNewAfter(node.content, action.id)})
                    )
                })
            }
        case 'REMOVE_NODE':
            return copyIfChanged(state, {nodes: 
                updateNodeById(state.nodes, action.id, 
                    node => null
                )
            })
        default:
            return state
    }
})

/* History actions */
window.store.addReducer((state, action, dispatch) => {
    switch (action.type) {
        case 'NODE_ACTION_EXECUTED':
            return copy(state, {
                history: state.history.concat([{ 
                    action: action.action, 
                    before: action.state, 
                    after: state.nodes 
                }]),
                future: []
            })
        case 'HISTORY_UNDO': {
            let n = state.history.length - action.n - 1
            let prev = state.history[n]
            return copy(state, {
                nodes: prev.before,
                history: state.history.slice(0, -action.n - 1),
                future: state.future.concat( state.history.slice(n).reverse() )
            })
        }
        case 'HISTORY_REDO': {
            let n = state.future.length - action.n - 1
            let next = state.future[n]
            return copy(state, {
                nodes: next.after,
                history: state.history.concat( state.future.slice(n).reverse() ),
                future: state.future.slice(0,-action.n - 1)
            })
        }
		default:
			return state
	}
})

function copyIfChanged(obj, props) {
    var changed = false
    for (let p in props) 
        if (props[p] !== obj[p]) {
            changed = true
            break
        }
    return changed ? copy(obj, props) : obj
}

function insertNewAfter(nodes, id) {
    var pos = id === null ? 0 : -1
    for (let i = 0; i < nodes.length; i++)
        if (nodes[i].id === id) {
            pos = i + 1
            break
        }
    if (pos === -1) pos = nodes.length
    return nodes.slice(0,pos).concat([ node() ]).concat(nodes.slice(pos))
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
                return copy(node, {content: updatedContent})
            }
        }
    }).filter(n => n !== null)
    return changed ? updated : nodes
}

