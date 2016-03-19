// --- Dispatcher

var Dispatcher = {
	listeners: [],
	queue: [],
	processing: false,
	dispatch(action, data) {
		this.queue.push([action,data]);
		this.process();
	},
	process() {
		if (! this.processing) {
			this.processing = true;
			try {
				while (this.queue.length)
					this.doDispatch.apply(this, this.queue.shift());
			}
			catch (e) { console.error(e); }
			this.processing = false;
		}
	},
	doDispatch(action, data) {
		this.listeners.map(l => l(action, data));
	},
	on(f) {
		this.listeners.push(f);
	}
}

// --- Model

class ContainerModel {
	constructor() {
		this.items = [];
	}
	insert(i) {
		this.items.splice(i, 0, new BlockModel(this));
	}
}

class BlockModel {
	constructor(parent) {
		this.parent = parent;
		this.type = 'p';
		this.value = "";
	}
}

var DocumentStore = new ContainerModel;
Dispatcher.on((action,data) => {switch (action) {
	case 'insert':
		DocumentStore.insert(data);
		Dispatcher.dispatch('updated', DocumentStore);
		break;
	case 'update-value':
		data.block.value = data.value;
		Dispatcher.dispatch('updated', DocumentStore);
		break;
	case 'updated':
		console.log(DocumentStore);
		break;
}});

// --- View

var {Button,PageHeader,Navbar,Nav,Input,ButtonToolbar,ButtonGroup,
	Glyphicon} = ReactBootstrap;

class OnlineButton extends React.Component {
	constructor() {
		super();
		this.state = { 
			online: true 
		};
	}
	toggle() { 
		this.setState({online: ! this.state.online}); 
	}
	render() {
		var {online} = this.state;
		return (
		  	<Button className="pull-right" 
		  		    bsSize="xsmall" 
		  		    onClick={() => this.toggle()}
		  		    active={online}
		  		    bsStyle={online ? 'success' : 'danger'}>
		  		{online ? 'ON' : 'OFF'}LINE
	  		</Button>
		);
	}
}

class Container extends React.Component {
	constructor(props) {
		super(props);
		this.state = {blocks: props.content}
		if (props.subscribe) {
			Dispatcher.on((action,data) => {
				if (action === 'updated')
					this.setState({blocks: data.items})
			});
		}
	}
	insert(i) {
		Dispatcher.dispatch('insert', i);
	}
	render() {
		let {blocks} = this.state;
		let inserter = i => 
			<div className="inserter" 
				 onClick={() => this.insert(i)} 
				 title="Add block here">+</div>
		return (
			<div>
				{blocks.map((block, i) => [
					inserter(i), 
					<Block value={block.value} onChange={v => 
						Dispatcher.dispatch("update-value", {block,value:v})}/>
				])}
				{inserter(blocks.length)}
			</div>
		);
	}
}

class Block extends React.Component {
	constructor(props) {
		super(props);
		this.activated = false;
		this.state = { 
			editing: false,
			value: props.value || ""
		};
	}
	edit() {
		if (! this.state.editing) {
			this.activated = true;
			this.setState({ editing: true });
		}
	}
	edited() {
		this.props.onChange(this.refs.text.getDOMNode().value);
	}
	componentDidUpdate() {
		if (this.activated) {
			this.activated = false;
			let text = this.refs.text.getDOMNode();
			text.focus();
			text.selectionStart = this.state.value.length;
			window.setTimeout(() => this.growText(), 10);
		}
	}
	growText() {
		if (this.refs.text && this.refs.text.getDOMNode()) {
			let text = this.refs.text.getDOMNode();
			text.style.height = text.scrollHeight +'px';
		}
	}
	render() {
		return (
			<div className="block" onClick={() => this.edit()}>
				<div className="tools">
					&sect;
					<ButtonToolbar className="pull-right buttons">
						<ButtonGroup bsSize="xsmall">
							<Button><Glyphicon glyph="chevron-up" title="Add block before"/></Button>
						</ButtonGroup>
					</ButtonToolbar>
				</div>
				{this.state.editing 
					? <textarea ref="text" 
								defaultValue={this.state.value}
								rows="1"
								onChange={() => this.growText()}
								onBlur={() => this.edited()}/>
					: <div className="content">
						{this.state.value}
					  </div>
				}
			</div>
		);
	}
}

const body = (
	<div>
	  <PageHeader>
	  	Document
	  	<OnlineButton/>
	  </PageHeader>
	  <Container content={DocumentStore.items} subscribe={true}/>
    </div>
);

React.render(body, document.body);