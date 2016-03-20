
window.Actions = {
	insertAfter: (parent,after) => ({
		type: 'INSERT_NODE_AFTER',
		parent,
		after
	}),
	changeText: (id,text) => ({
		type: 'CHANGE_NODE_TEXT',
		id,
		value: text
	}),
	removeNode: id => ({
		type: 'REMOVE_NODE',
		id
	}),
	changeType: (id,type) => ({
		type: 'CHANGE_NODE_TYPE',
		changeTo: type,
		id
	}),
	changeTitle: (id,value) => ({
		type: 'CHANGE_NODE_TITLE',
		id, value
	})
}

var uniqIdSeq = 0

/**
 * State structure:
 * 	- id
 *	- type: string = p | container | h1-h3 | ul | ol
 *	- content: string | list of blocks
 */
window.store = 
new Store((state, action) => {
	if (typeof state === 'undefined')
		// initial state
		return {
			id: uniqIdSeq++,
			type: 'container',
			root: true,
			content: [{
				id: uniqIdSeq++,
				type: 'p',
				content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
			},{
				id: uniqIdSeq++,
				type: 'ul',
				content: [{
					id: uniqIdSeq++,
					type: 'container',
					title: 'Section',
					content: [{
						id: uniqIdSeq++,
						type: 'p',
						content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
					}]
				},{
					id: uniqIdSeq++,
					type: 'p',
					content: 'Second item'
				},{
					id: uniqIdSeq++,
					type: 'p',
					content: 'Third item'
				}]
			},{
				id: uniqIdSeq++,
				type: 'p',
				content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
			}]
		}
	else switch (action.type) {
		case 'INSERT_NODE_AFTER':
			return insertAfter(state, action.parent, action.after)
		case 'CHANGE_NODE_TEXT':
			return updateNodeById(state, action.id, node => copy(node, {content: action.value}))		
		case 'CHANGE_NODE_TITLE':
			return updateNodeById(state, action.id, node => copy(node, {title: action.value}))		
		case 'REMOVE_NODE':
			return updateNodeById(state, action.id, node => null)
		case 'CHANGE_NODE_TYPE':
			return updateNodeById(state, action.id, node => copy(node, {
				type: action.changeTo,
				content: Store.isContainerType(node.type) === Store.isContainerType(action.changeTo)
					? node.content : (Store.isContainerType(action.changeTo) ? [] : "")
			}))
		default:
			return state
	}
})

function updateNodeById(node, id, f) {
	if (node.id === id) {
		return f(node)
	}
	else if (node.content.push) {
		return copy(node, {
			content: node.content.map(n => updateNodeById(n,id,f,false)).filter(n => n !== null)
		})
	}
	else {
		return node
	}
}

Store.isContainerType = type => {
	switch (type) {
		case 'container':
		case 'ul':
			return true;
		default:
			return false;
	}
}

function insertAfter(node, parent, after) {
	return updateNodeById(node, parent, node => {
		let content = [],
			add = () => content.push({id: uniqIdSeq++, type: 'p', content: '', title: ''})

		if (after === null) add()
		node.content.map(node => {
			content.push(node)
			if (node.id === after) add()
		})
		if (content.length == node.content.length) 
			add()

		return copy(node, {content})
	})
}





