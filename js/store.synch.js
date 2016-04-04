function update(store) {
	$.get('server.php?'+ Math.random(), (nodes, status, xhr) => {
        let state = store.getState()
        let timestamp = xhr.getResponseHeader('Last-Modified')
        if (state.timestamp !== timestamp) {
            store.dispatch(SynchModule.actions.dataReceived(nodes, timestamp))
        }
    })
}
function save(store, nodes, timestamp) {
	$.post({
		url: 'server.php', 
		data: {nodes: JSON.stringify(nodes,null,2)}, 
		headers: {
			"Last-Modified": timestamp
		},
		success: (res, status, xhr) => {
			store.dispatch(SynchModule.actions.
				dataSaved(xhr.getResponseHeader('Last-Modified')))
		},
		error: (xhr, status, httpError) => {
			console.log(httpError)
			window.setTimeout(() =>
				store.dispatch(SynchModule.actions.dataSaveRetry()),
				1000)
		}
	})
}

window.SynchModule = {
	actions: {
	    dataReceived: (nodes, timestamp) => ({
	        type: 'SERVER_DATA_RECEIVED',
	        nodes, timestamp
	    }),
	    dataSaved: timestamp => ({
	        type: 'SERVER_DATA_SAVED',
	        timestamp
	    }),
	    dataLoad: () => ({
	    	type: 'SERVER_LOAD_DATA'
	    }),
	    onlineState: active => ({
	        type: 'SERVER_ONLINE_STATUS',
	        active
	    }),
	    dataSaveRetry: () => ({
	    	type: 'SERVER_RETRY_SAVE'
	    })
	},
	updateProcess: null,
	update: function(store) {
		if (store && ! this.updateProcess) {
			this.updateProcess = window.setInterval(() => update(store), 1000)
		}
		else if (! store && this.updateProcess) {
			window.clearInterval(this.updateProcess)
			this.updateProcess = null
		}
	},
	reducer: function(state, action, dispatch) {
	    switch (action.type) {

	        case 'SERVER_DATA_RECEIVED':
	            if (state.timestamp != action.timestamp) {
	                state.history.map(({action}) => dispatch(action))
	            }
	            return {
	                nodes: action.nodes,
	                history: [],
	                future: [],
	                active: state.active,
	                timestamp: action.timestamp
	            }

            case 'SERVER_LOAD_DATA':
            	SynchModule.update(this)
            	return state

	        case 'SERVER_ONLINE_STATUS':
	        	if (action.active) {
            		dispatch(SynchModule.actions.dataLoad())
            		dispatch(SynchModule.actions.dataSaveRetry())
	        	}
            	else
            		SynchModule.update(null)
            	
	            return iUpdate(state, {
	                active: action.active
	            })

	        case 'SERVER_DATA_SAVED':
	            return iUpdate(state, {
	                timestamp: action.timestamp,
	                history: state.history.filter(h => ! h.freezed)
	            })

	        default:
	        	let forceUpdate = (action.type == 'SERVER_RETRY_SAVE')
				let updated = state.history.length > 0 && ! state.history[0].freezed
				if (state.active && (updated || forceUpdate)) {
					save(this, state.nodes, state.timestamp)
					return iUpdate(state, {
						history: state.history.map(h => iUpdate(h,{freezed:true}))
					})
				}
	            return state
	    }
	}
}
