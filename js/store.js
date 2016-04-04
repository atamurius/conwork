window.Store = 
// Store manages state and dispatches actions on it
class Store {
	constructor(initialState, ...reducers) {
		this.state = initialState
		this.listeners = new Observable
		this.reducers = reducers
		this.dispatch = queued(this.dispatch)
	}
	getState() {
		return this.state
	}
	dispatch(action) {
		this.state = this.reducers.
			reduce((state, f) => f.call(this, state, action, this.dispatch.bind(this)),
				this.state)
		this.logAction(action)
		this.listeners.notify(this, this.state, action)
	}
	bindAction(action) {
		return (...args) => this.dispatch(action.apply(null,args))
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
		this.listeners.subscribe(f);
	}
}

function queued(f) {
	let id = 'queued'+ Math.random(),
		queue = id +'_queue'
	return function(...args) {
		if (typeof this[id] === 'undefined') {
			this[id] = false
			this[queue] = []
		}
		this[queue].push(args)
		if (! this[id]) {
			this[id] = true
			try {
				while (this[queue].length > 0)
					f.apply(this, this[queue].shift())
			}
			finally {
				this[id] = false
			}
		}
	}
}

class Observable {
	constructor() {
		this.observers = []
	}
	subscribe(observer) {
		this.observers.push(observer);
	}
	notify(source, ...args) {
		this.observers.map(observer => observer.apply(source, args))
	}
}