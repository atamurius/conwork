
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
    undo: () => ({
        type: 'HISTORY_UNDO'
    }),
    redo: () => ({
        type: 'HISTORY_REDO'
    })
}

var uniqIdSeq = 0

function node(value = '', content = []) {
    return {
        id: uniqIdSeq++,
        value, content
    }
}

/**
 * State structure: list of blocks, each block is:
 * 	- id
 *	- value
 *	- content: list of blocks
 */
window.store = 
new Store((state, action, dispatch) => {
	if (typeof state === 'undefined')
		// initial state
		return {
            history: [],
            future: [],
            nodes: [
                node(
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                ),
                node(
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                    [
                        node(
                            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                        ),
                        node(
                            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                        ),
                        node(
                            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', [
                                node(
                                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                                ),
                                node(
                                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                                )
                            ]
                        )
                    ]
                ),
                node(
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                ),
                node(
                    'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', [
                        node(
                            'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                        )
                    ]
                )
    		]
        }
	else switch (action.type) {
        case 'CHANGE_NODE_VALUE':
            dispatch(Actions.nodeAction(action, state.nodes))
            return copyIfChanged(state, {nodes: 
                updateNodeById(state.nodes, action.id, 
                    node => copy(node, {value: action.value})
                )
            })
        case 'INSERT_NODE_AFTER':
            dispatch(Actions.nodeAction(action, state.nodes))
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
            dispatch(Actions.nodeAction(action, state.nodes))
            return copyIfChanged(state, {nodes: 
                updateNodeById(state.nodes, action.id, 
                    node => null
                )
            })
        case 'NODE_ACTION_EXECUTED':
            return copy(state, {
                history: state.history.concat([ { action: action.action, state: action.state } ]),
                future: []
            })
        case 'HISTORY_UNDO':
            let prev = state.history[ state.history.length - 1 ]
            let newState = prev.state
            prev.state = state.nodes
            return copy(state, {
                nodes: newState,
                history: state.history.slice(0,-1),
                future: state.future.concat([ prev ])
            })
        case 'HISTORY_REDO':
            let next = state.future[ state.future.length - 1 ]
            let oldState = next.state
            next.state = state.nodes
            return copy(state, {
                nodes: oldState,
                history: state.history.concat([ next ]),
                future: state.future.slice(0,-1)
            })
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

