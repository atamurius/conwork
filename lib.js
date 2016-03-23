window.Store = 
class Store {
	constructor(reducer) {
		this.reducer = reducer;
		this.state = reducer();
		this.queue = [];
		this.dispatching = false;
		this.listeners = [];
	}
	addReducer(reducer) {
		let current = this.reducer
		this.reducer = (state, action, dispatch) => 
			reducer(current(state, action, dispatch), action, dispatch)
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
			try {
				while (this.queue.length) {
					let action = this.queue.shift();
					this.state = this.reducer(this.state, action, dispatch);
					console.log('Action', action)
					console.log('State', this.state)
				}
			}
			finally {
				this.dispatching = false;
				this.updated();
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

window.copy = (obj, props) => {
	let copy = {}
	for (let p in obj) copy[p] = obj[p]
	for (let p in props) copy[p] = props[p]
	return copy
}

