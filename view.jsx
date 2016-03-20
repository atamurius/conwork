var {Button,PageHeader,Navbar,Nav,Input,ButtonToolbar,ButtonGroup,
	Glyphicon,DropdownButton,MenuItem} = ReactBootstrap

let OnlineButton = ({online,update}) => (
	<Button className="pull-right" 
		    bsSize="xsmall" 
		    onClick={() => update(! online)}
		    active={online}
		    bsStyle={online ? 'success' : 'danger'}>
		{online ? 'ON' : 'OFF'}-LINE
	</Button>
)

let Container = ({block,actions,header}) => {
	let inserter = after => 
		<div className="inserter" 
			 onClick={() => actions.insertAfter(block.id,after)} 
			 title="Add block here">+</div>
	return (
		<div className={'container' + (block.root ? ' root' : '')}>
			{header ? <TextField value={block.title} placeholder="Title" 
								onChange={title => actions.changeTitle(block.id,title)}/> : ''}
			{inserter(null)}
			{block.content.map(b => 
				<div key={b.id}>
					<Block block={b}
						   parent={block}
						   actions={actions}/>
					{inserter(b.id)}
				</div>
			)}
		</div>
	)
}

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
						{value === '' ? this.placeholder : value}
		  		   </div>
	}
}

class Block extends React.Component {
	constructor(props) {
		super(props)
		this.types = {
			'p': 'Paragraph',
			'ul': 'Unordered list',
			'container': 'Container'
		}
	}
	typeValues() {
		let vals = [],
			{block,actions} = this.props
		for (let t in this.types) {
			vals.push(<MenuItem onSelect={() => actions.changeType(block.id,t)} 
								key={t}>
							{this.types[t]}
					  </MenuItem>)
		}
		return vals
	}
	// componentDidUpdate() {
	// 	let block = $(this.refs.block);
	// 	block.removeClass('changed');
	// 	window.setTimeout(() => block.addClass('changed'), 50)
	// }
	renderContent() {
		let {block,actions} = this.props
		if (! Store.isContainerType(block.type)) {
			return <TextField value={block.content} 
							  onChange={text => actions.changeText(block.id,text)}/>
		}
		else {
	    	return <Container block={block} actions={actions} header={block.type === 'container'}/>
		}
	}
	render() {
		let {block,actions} = this.props
		return (
			<div className={'block '+ block.type} ref="block">
				<div className="tools">
					<DropdownButton navDropdown title={this.types[ block.type ]}>
						{this.typeValues()}
					</DropdownButton>
					<div className="pull-right buttons">
						<Glyphicon glyph="remove" 
								   onClick={() => actions.removeNode(block.id)}
								   title="Remove this block"/>
					</div>
				</div>
				{this.renderContent()}
			</div>
		)
	}
}

class Root extends React.Component {
	constructor(props) {
		super(props)
		this.store = props.store
		this.state = props.store.state
		props.store.subscribe(this.setState.bind(this))
		this.actions = this.store.dispatcher(Actions)
	}
	render() {
		return <Container block={this.state} 
						  actions={this.actions}/>
	}
}

const body = (
	<div>
	  <PageHeader>
	  	Concurrent page editor
	  	<OnlineButton online={true}/>
	  </PageHeader>
	  <Root store={store}/>
    </div>
)

ReactDOM.render(body, document.getElementById('content-root'))