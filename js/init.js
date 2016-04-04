let store = new Store(
    {
        history: [],
        future: [],
        nodes: [],
        active: true,
        timestamp: null        
    },
    HistoryModule.reducer,
    NodesModule.reducer,
    SynchModule.reducer
)
store.dispatch(SynchModule.actions.dataLoad())

let actions = {},
    modules = [HistoryModule,NodesModule,SynchModule]

modules.map(module => {
    for (let act in module.actions) {
        let action = module.actions[act]
        actions[act] = store.bindAction(action)
    }
})

ReactDOM.render(React.createElement(PageView, {store, actions}), document.getElementById('content-root'))