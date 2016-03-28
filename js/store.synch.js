class Server {
	resume() {
		this.update(this.store)
	}
    update(store) {
    	this.store = store
        $.get('server.php?'+ Math.random(), (nodes, status, xhr) => {
            let state = store.getState()
            let timestamp = xhr.getResponseHeader('Last-Modified')
            if (state.timestamp !== timestamp) {
                store.dispatch(SynchModule.actions.dataReceived(nodes, timestamp))
            }
            if (state.active)
                window.setTimeout(() => this.update(store), 1000)
        })
    }
    save(store, nodes, timestamp) {
    	$.post({
    		url: 'server.php', 
    		data: {nodes: JSON.stringify(nodes,null,2)}, 
    		headers: {
    			"Last-Modified": timestamp
    		},
    		success: (res, status, xhr) => {
    			store.dispatch(SynchModule.actions.
    				dataSaved(xhr.getResponseHeader('Last-Modified')))
    		}
    	})
    }
}

var server = new Server

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
	    onlineState: active => ({
	        type: 'SERVER_ONLINE_STATUS',
	        active
	    })	
	},
	server: server,
	reducer: (state, action, dispatch, defer) => {
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

	        case 'SERVER_ONLINE_STATUS':
	            defer(() => server.resume())
	            return iUpdate(state, {
	                active: action.active
	            })

	        case 'SERVER_DATA_SAVED':
	            return iUpdate(state, {
	                timestamp: action.timestamp,
	                history: [],
	                future: []
	            })

	        default:
	            return state
	    }
	}
}
