import { CollectionArgument, Core } from 'cytoscape';
import { nodeSelectedStyle, edgeSelectedStyle, nodeStyle, edgeStyle, nodeHighlightStyle, edgeHighlightStyle } from './cytoscape';

export const random = () => Math.random().toString(36).substring(2);

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

const highlightColor = '#3CB371';

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

const selectedColor = '#1E90FF';

export const setCyEdgeSelectedClass = (cy: Core) => {
	cy.style().selector('.edge_selected').style({
		'line-color': selectedColor,
		'target-arrow-color': selectedColor,
		'color': selectedColor
	});
};
