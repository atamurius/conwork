window.store = new Store({
    history: [],
    future: [],
    nodes: [],
    active: true,
    timestamp: null        
})
window.actions = window.store.dispatcher(iMerge([
    window.NodesModule.actions,
    window.HistoryModule.actions,
    window.SynchModule.actions
]))

window.store.addReducer(window.HistoryModule.preReducer)
window.store.addReducer(window.NodesModule.reducer)
window.store.addReducer(window.HistoryModule.postReducer)
window.store.addReducer(window.SynchModule.reducer)

$(() => {
    window.SynchModule.server.update(window.store)
    window.store.subscribe(state => {
        if (state.active && state.history.length > 0) {
            window.SynchModule.server.save(window.store, state.nodes, state.timestamp)
        }
    })
})