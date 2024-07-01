import { CollectionArgument, Core, NodeSingular } from 'cytoscape';

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

export const clearStyle = (cy: Core, directed: boolean, includeSelscted = false) => {
	if (includeSelscted) {
		cy.$('node:selected').unselect();
		cy.$('edge:selected').unselect();
	} else {
		cy.$('node:selected').style(nodeSelectedStyle);
		cy.$('edge:selected').style(edgeSelectedStyle);
	}
	cy.$('node:unselected').style({ ...nodeStyle, label: undefined });
	cy.$('edge:unselected').style({
		...edgeStyle,
		label: undefined,
		...!directed ? { 'target-arrow-shape': 'none' } : {}
	});
};

export type LayoutType = 'random' | 'grid' | 'circle' | 'concentric' | 'breadthfirst' | 'cose';

export const resetLayout = (cy: Core, directed = true, layout: LayoutType = 'random') => {
	const animateConfig = {
		animate: true,
		animationDuration: 500,
		animationEasing: 'ease-in-out'
	};

	if (layout === 'random' || layout === 'grid' || layout === 'circle') {
		cy.layout({
			name: layout,
			...animateConfig,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			padding: 10
		}).run();
	} else if (layout === 'concentric') {
		const deepth = (cy.elements().dfs({ roots: cy.elements().roots() }).path.length - 1) / 2;

		cy.layout({
			name: layout,
			...animateConfig,
			clockwise: true,
			fit: true,
			padding: 10,
			minNodeSpacing: Math.min(cy.height(), cy.width()) / deepth,
			concentric: (node: NodeSingular) => node.degree(false),
			levelWidth: () => deepth
		}).run();
	} else if (layout === 'breadthfirst') {
		cy.layout({
			name: layout,
			...animateConfig,
			directed,
			padding: 10
		}).run();
	} else if (layout === 'cose') {
		cy.layout({
			name: layout,
			animate: false,
			idealEdgeLength: () => 100,
			nodeOverlap: 20,
			fit: true,
			padding: 30,
			randomize: false,
			componentSpacing: 100,
			nodeRepulsion: () => 400000,
			edgeElasticity: () => 100,
			nestingFactor: 5,
			gravity: 80,
			numIter: 1000
		}).run();
	}
};

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
