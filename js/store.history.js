window.HistoryModule = {
	actions: {
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
	},
	preReducer: (state, action, dispatch) => {
	    if (action.persistentAction) {
	        dispatch(HistoryModule.actions.nodeAction(action,state.nodes))
	    }
	    return state
	},
	postReducer: (state, action, dispatch) => {
	    switch (action.type) {

	        case 'NODE_ACTION_EXECUTED':
	            return iUpdate(state, {
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
	            return iUpdate(state, {
	                nodes: prev.before,
	                history: state.history.slice(0, -action.n - 1),
	                future: state.future.concat( state.history.slice(n).reverse() )
	            })
	        }

	        case 'HISTORY_REDO': {
	            let n = state.future.length - action.n - 1
	            let next = state.future[n]
	            return iUpdate(state, {
	                nodes: next.after,
	                history: state.history.concat( state.future.slice(n).reverse() ),
	                future: state.future.slice(0,-action.n - 1)
	            })
	        }

			default:
				return state
		}
	}
}