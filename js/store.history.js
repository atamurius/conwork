window.HistoryModule = {
	actions: {
	    undo: (n = 0) => ({
	        type: 'HISTORY_UNDO', n
	    }),
	    redo: (n = 0) => ({
	        type: 'HISTORY_REDO', n
	    })
	},
	reducer: (state, action, dispatch) => {
	    switch (action.type) {

	        case 'CHANGE_NODE_VALUE':
	        case 'INSERT_NODE_AFTER':
	        case 'REMOVE_NODE':
	            return iUpdate(state, {
	                history: state.history.concat([{ 
	                    action, 
	                    state: state.nodes
	                }]),
	                future: action.redo ? state.future : []
	            })

	        case 'HISTORY_UNDO': {
	        	let history = state.history.slice(),
	        		future = state.future.slice(),
	        		last = null
	        	for (let i = action.n; i >= 0; i--) {
	        		last = history.pop()
	        		future.push(last)
	        	}
	            return iUpdate(state, {
	                nodes: last.state,
	                history, future
	            })
	        }

	        case 'HISTORY_REDO': {
	        	let future = state.future.slice()
	        	for (let i = action.n; i >= 0; i--) {
		            dispatch(iUpdate(
		            	future.pop().action,
		            	{redo: true}
	            	))
	        	}
	            return iUpdate(state, {
	                future
	            })
	        }

			default:
				return state
		}
	}
}