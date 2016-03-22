var {Button,PageHeader,Navbar,Nav,Input,ButtonToolbar,ButtonGroup,
	Glyphicon,DropdownButton,MenuItem,SplitButton} = ReactBootstrap

var {CSSTransitionGroup} = React.addons

class TextField extends React.Component {
	constructor(props) {
		super(props)
		this.activated = false;
		this.state = { 
			editing: false
		}
	}
	edit() {
		if (! this.state.editing) {
			this.activated = true
			this.setState({ editing: true })
		}
	}
	edited() {
		let origin = this.props.value,
			change = this.refs.text.value
		this.setState({
			editing: false
		})
		if (origin !== change)
			this.props.onChange(change)
	}
	componentDidUpdate() {
		if (this.activated) {
			this.activated = false
			let text = this.refs.text
			text.focus()
			text.selectionStart = text.value.length
			window.setTimeout(() => this.growText(), 10)
		}
	}
	growText() {
		if (this.refs.text) {
			let text = this.refs.text
			text.style.height = text.scrollHeight +'px'
		}
	}
	render() {
		let {value} = this.props,
			placeholder = this.props.placeholder ?
				<span className="placeholder">{this.props.placeholder}</span> :
				<span>&nbsp;</span>

		if (this.state.editing) 
			return  <textarea ref="text" 
						defaultValue={value}
						rows="1"
						onChange={() => this.growText()}
						onBlur={() => this.edited()}/>
		else
			return <div className="content" onClick={() => this.edit()}>
						{value === '' ? placeholder : value}
		  		   </div>
	}
}

let Items = ({id,blocks,actions}) => {
	let inserter = (after) => (
		<div className="inserter" 
			 key={"after-"+ after} 
			 onClick={() => actions.insertAfter(id,after)}
			 title="Insert block here">&bull; &bull; &bull;</div>
	)
	return (
		<CSSTransitionGroup transitionName="block" 
							className="items"
							component="div"
							transitionEnterTimeout={500}
							transitionLeaveTimeout={500}>
			{blocks.reduce((list,block) => 
				list.concat([
					<Block key={block.id} block={block} actions={actions}/>, 
					inserter(block.id)
				]), 
				[ inserter(null) ])}
		</CSSTransitionGroup>
	)
}

let Block = ({block,actions}) => (
	<div className="block">
		<Glyphicon glyph="remove" title="Remove block and it's children" onClick={() => actions.removeNode(block.id)}/>
		<TextField value={block.value} placeholder="Contents" onChange={value => actions.changeValue(block.id,value)}/>
		<Items blocks={block.content} id={block.id} actions={actions}/>
	</div>
)

class Root extends React.Component {
	constructor(props) {
		super(props)
		this.store = props.store
		this.state = props.store.state
		props.store.subscribe(this.setState.bind(this))
		this.actions = this.store.dispatcher(Actions)
	}
	render() {
		return (
			<Items blocks={this.state.nodes} actions={this.actions} id={null}/>
		)
	}
}


let OnlineButton = ({online,update}) => (
	<Button bsSize="small" 
		    onClick={() => update(! online)}
		    active={online}
		    bsStyle={online ? 'success' : 'danger'}>
		{online ? 'ON' : 'OFF'}-LINE
	</Button>
)

let describeAction = act => {
	switch (act.type) {
		case 'CHANGE_NODE_VALUE':
			return 'Change node value to "'+ act.value.substr(0, 20) +'"'
		case 'INSERT_NODE_AFTER':
			return 'Insert new node'
		case 'REMOVE_NODE':
			return 'Remove node'
	}
}

let HistoryButton = ({events,onClick,children}) => (
	<SplitButton disabled={events.length == 0} title={children} bsSize="small" onClick={() => onClick(0)}>
		{events.slice().reverse().map((e,i) => 
			<MenuItem key={i} onClick={() => onClick(i)}>{describeAction(e.action)}</MenuItem>
		)}
	</SplitButton>
)

class Toolbar extends React.Component {
	constructor(props) {
		super(props)
		this.store = props.store
		let {history,future} = this.store.state
		this.state = {history,future}
		props.store.subscribe(state => {
			let {history,future} = state
			this.setState({history,future})
		})
		this.actions = this.store.dispatcher(Actions)
	}
	render() {
		return (
		  	<ButtonToolbar className="pull-right">
		  		<HistoryButton events={this.state.history} onClick={this.actions.undo}>
					<Glyphicon glyph="chevron-left" /> 
					Undo {this.state.history.length > 0 ? <span className="badge">{this.state.history.length}</span> : ''}
		  		</HistoryButton>
		  		<HistoryButton events={this.state.future} onClick={this.actions.redo}>
					Redo {this.state.future.length > 0 ? <span className="badge">{this.state.future.length}</span> : ''}
					<Glyphicon glyph="chevron-right" /> 
		  		</HistoryButton>
			  	<OnlineButton online={true}/>
		  	</ButtonToolbar>
		)
	}
}

const body = (
	<div>
	  <PageHeader>
	  	Concurrent page editor
	  	<Toolbar store={store}/>
	  </PageHeader>
	  <Root store={store}/>
    </div>
)

ReactDOM.render(body, document.getElementById('content-root'))