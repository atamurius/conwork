window.Store = 
// Store manages state and dispatches actions on it
class Store {
	constructor(initialState) {
		this.reducer = (state, action, dispatch, defer) => state
		this.state = initialState
		this.queue = []
		this.dispatching = false
		this.listeners = []
	}
	getState() {
		return this.state
	}
	addReducer(next) {
		let current = this.reducer
		this.reducer = (state, action, dispatch, defer) => {
			let currentState = current(state, action, dispatch, defer)
			return next(currentState, action, dispatch, defer)
		}
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
					this.logAction(action)
				}
			}
			finally {
				this.dispatching = false;
				this.notify();
				deferred.map(f => f())
			}
		}
	}
	logAction(action) {
		if (action) {
			console.groupCollapsed(action.type);
			for (let f in action)
				if (f !== 'type')
					console.log(f, action[f])
		}
		console.log('New state: ', this.state)
		console.groupEnd();
	}
	subscribe(f) {
		this.listeners.push(f);
	}
	notify() {
		this.listeners.map(f => f(this.state));
	}
}
