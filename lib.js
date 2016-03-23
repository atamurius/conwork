window.Store = 
class Store {
	constructor(reducer) {
		this.reducer = reducer;
		this.state = undefined;
		this.queue = [];
		this.dispatching = false;
		this.listeners = [];
		this.dispatch()
	}
	addReducer(reducer) {
		let current = this.reducer
		this.reducer = (state, action, dispatch, defer) => 
			reducer(current(state, action, dispatch, defer), action, dispatch, defer)
	}
	dispatch(action) {
		this.queue.push(action);
		this.process();
	}
	dispatcher(f) {
		if (typeof f === 'object') {
			let res = {}
			for (let p in f) {
				res[p] = this.dispatcher(f[p])
			}
			return res
		}
		else {
			let store = this
			return function() {
				store.dispatch(f.apply(null,arguments))
			}
		}
	}
	process() {
		if (! this.dispatching) {
			this.dispatching = true;
			let dispatch = this.dispatch.bind(this);
			let deferred = []
			let defer = f => deferred.push(f)
			try {
				while (this.queue.length) {
					let action = this.queue.shift();
					this.state = this.reducer(this.state, action, dispatch, defer);
					console.log('Action', action)
					console.log('State', this.state)
				}
			}
			finally {
				this.dispatching = false;
				this.updated();
				deferred.map(f => f())
			}
		}
	}
	subscribe(f) {
		this.listeners.push(f);
	}
	updated() {
		this.listeners.map(f => f(this.state));
	}
}

window.Server = class Server {
    update() {
        $.get('server.php?'+ Math.random(), (nodes, status, xhr) => {
            let s = window.store
            let timestamp = xhr.getResponseHeader('Last-Modified')
            if (s.state.timestamp !== timestamp) {
                s.dispatch(Actions.dataReceived(nodes, timestamp))
            }
            if (s.state.active)
                window.setTimeout(() => this.update(), 1000)
        })
    }
    save(nodes, timestamp) {
    	$.post({
    		url: 'server.php', 
    		data: {nodes: JSON.stringify(nodes)}, 
    		headers: {
    			"Last-Modified": timestamp
    		},
    		success: (res, status, xhr) => 
    			window.store.dispatch(Actions.
    				dataSaved(xhr.getResponseHeader('Last-Modified')))
    	})
    }
}

window.copy = (obj, props) => {
	let copy = {}
	for (let p in obj) copy[p] = obj[p]
	for (let p in props) copy[p] = props[p]
	return copy
}

