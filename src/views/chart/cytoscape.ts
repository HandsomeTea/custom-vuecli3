import { CollectionArgument, Core } from 'cytoscape';

const selectedColor = '#1E90FF';
const highlightColor = '#3CB371';

export const nodeStyle = {
	'background-color': '#696969',
	'font-size': 12,
	color: '#696969',
	'border-width': 3,
	'border-color': '#fff',
	'label': 'data(label)'
};

export const edgeStyle = {
	'width': 3,
	'font-size': 12,
	'line-color': '#D3D3D3',
	'target-arrow-color': '#D3D3D3',
	'target-arrow-shape': 'triangle',
	'line-opacity': 1,
	'curve-style': 'bezier',
	'text-rotation': 'autorotate',
	'text-background-opacity': 1,
	'text-background-color': 'white',
	'text-background-padding': '2px',
	'color': '#808080',
	// 'text-margin-y': -14,
	'label': 'data(label)'
};

export const nodeHighlightStyle = {
	'background-color': highlightColor
};

export const edgeHighlightStyle = {
	'line-color': highlightColor,
	'target-arrow-color': highlightColor
};

export const nodeSelectedStyle = {
	'border-width': 3,
	'border-color': selectedColor,
	'background-color': '#696969'
};

export const edgeSelectedStyle = {
	'line-color': selectedColor,
	'target-arrow-color': selectedColor,
	'color': selectedColor
};


export const clearStyle = (cy: Core, includeSelscted = false) => {
	if (includeSelscted) {
		cy.$('node:selected').unselect();
		cy.$('edge:selected').unselect();
	} else {
		cy.$('node:selected').style(nodeSelectedStyle);
		cy.$('edge:selected').style(edgeSelectedStyle);
	}
	cy.$('node:unselected').style({ ...nodeStyle, label: undefined });
	cy.$('edge:unselected').style({ ...edgeStyle, label: undefined });
};

export const resetLayout = (cy: Core) => cy.layout({
	name: 'breadthfirst',
	animate: true,
	animationDuration: 500,
	animationEasing: 'ease-in-out',
	directed: true,
	padding: 10
}).run();

export const highlightPaths = (paths: CollectionArgument) => {
	let i = 0;
	const showNextEle = () => {
		if (i < paths.length) {
			if (paths[i].isNode()) {
				paths[i].style(nodeHighlightStyle);
				i++;
			}

			if (paths[i].isEdge()) {
				paths[i].style(edgeHighlightStyle);
				i++;

				paths[i].style(nodeHighlightStyle);
				i++;
			}

			setTimeout(showNextEle, 200);
		}
	};

	showNextEle();
};

export const setCyNodeHighlightClass = (cy: Core) => {
	cy.style().selector('.node_highlight').style({
		'background-color': highlightColor
	});
};

export const setCyEdgeHighlightClass = (cy: Core) => {
	cy.style().selector('.edge_highlight').style({
		'line-color': highlightColor,
		'target-arrow-color': highlightColor
	});
};

export const setCyNodeSelectedClass = (cy: Core) => {
	cy.style().selector('.node_selected').style({
		'border-width': 3
	});
};

export const setCyEdgeSelectedClass = (cy: Core) => {
	cy.style().selector('.edge_selected').style({
		'line-color': selectedColor,
		'target-arrow-color': selectedColor,
		'color': selectedColor
	});
};
