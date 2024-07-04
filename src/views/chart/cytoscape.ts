import { CollectionArgument, CollectionReturnValue, Core, NodeSingular } from 'cytoscape';

const selectedColor = '#1E90FF';
const highlightColor = '#3CB371';

export const nodeStyle = {
	'background-color': '#696969',
	'font-size': 12,
	color: '#696969',
	'border-width': 3,
	'border-color': '#fff',
	label: 'data(label)'
};

export const edgeStyle = {
	width: 3,
	'text-opacity': 1,
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
	color: '#808080',
	// 'text-margin-y': -14,
	label: 'data(label)'
};

export const nodeHighlightStyle = {
	'background-color': highlightColor
};

export const edgeHighlightStyle = {
	'line-color': highlightColor,
	'target-arrow-color': highlightColor
};

export const edgeCutStyle = {
	width: 1,
	'line-opacity': 0.5,
	color: '#DCDCDC'
};

export const nodeCutStyle = {
	'background-color': 'red'
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
		cy.nodes(':selected').unselect();
		cy.edges(':selected').unselect();
	} else {
		cy.nodes(':selected').style(nodeSelectedStyle);
		cy.edges(':selected').style(edgeSelectedStyle);
	}
	cy.nodes(':unselected').style({ ...nodeStyle, label: undefined });
	cy.edges(':unselected').style({
		...edgeStyle,
		'text-opacity': cy.edges().style('text-opacity'),
		'text-background-opacity': cy.edges().style('text-background-opacity'),
		label: undefined,
		...!directed ? { 'target-arrow-shape': 'none' } : {}
	});
};

export const layoutList = [{
	name: '随机布局',
	value: 'random'
}, {
	name: '网格布局',
	value: 'grid'
}, {
	name: '圆形布局',
	value: 'circle'
}, {
	name: '同心圆布局',
	value: 'concentric'
}, {
	name: '广度优先布局',
	value: 'breadthfirst'
}, {
	name: 'Cose布局',
	value: 'cose'
}] as const;

export type LayoutType = typeof layoutList[number]['value'];

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

export const highlightElements = (eles: CollectionArgument) => {
	for (let s = 0; s < eles.length; s++) {
		if (eles[s].isNode()) {
			eles[s].style(nodeHighlightStyle);
		}

		if (eles[s].isEdge()) {
			eles[s].style(edgeHighlightStyle);
		}
	}
};

export const showCutElements = (eles: CollectionArgument) => {
	for (let s = 0; s < eles.length; s++) {
		if (eles[s].isEdge()) {
			eles[s].style(edgeCutStyle);
		}

		if (eles[s].isNode()) {
			eles[s].style(nodeCutStyle);
		}
	}
};

export const showComponents = (eles: CollectionReturnValue) => {
	const colors = ['#FF1493', '#8A2BE2', '#00BFFF', '#00FA9A', '#FF8C00', '#2E8B57', '#FFFF00'];

	if (!Array.isArray(eles)) {
		// eslint-disable-next-line no-console
		return console.warn('showComponents: eles is not an array');
	}

	if (eles.length > colors.length) {
		// eslint-disable-next-line no-console
		console.warn('showComponents: eles length is too long, components represented by colors may be repeated');
	}

	let colorIndex = 0;

	for (let i = 0; i < eles.length; i++) {
		for (let s = 0; s < eles[i].length; s++) {
			if (eles[i][s].isEdge()) {
				eles[i][s].style({
					'line-color': colors[colorIndex],
					'target-arrow-color': colors[colorIndex]
				});
			}

			if (eles[i][s].isNode()) {
				eles[i][s].style({
					'background-color': colors[colorIndex]
				});
			}
		}
		if (colorIndex === colors.length - 1) {
			colorIndex = 0;
		} else {
			colorIndex++;
		}
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

export const zoomCy = (cy: Core, level: number) => {
	const container = cy.container();

	if (container) {
		cy.zoom({
			level,
			position: {
				x: container.offsetWidth / 2,
				y: container.offsetHeight / 2
			}
		});
	}
};
export const displayDataSet = [{
	name: '默认',
	value: 'default'
}, {
	name: '最小生成树',
	value: 'mst'
}, {
	name: '最小割',
	value: 'min-cut'
}, {
	name: '最短路径',
	value: 'shortest-path'
}, {
	name: '强联通分量',
	value: 'strong-connected-components'
}, {
	name: '双联通分量',
	value: 'biconnected-components'
}, {
	name: '马尔可夫聚类',
	value: 'markov-clustering'
}] as const;

export type DataSet = typeof displayDataSet[number]['value'];

export const setDataSet = (cy: Core, dataset: DataSet) => {
	cy.elements().remove();

	if (dataset === 'default') {
		cy.add([
			{ data: { id: 'a', label: 'a' } },
			{ data: { id: 'b', label: 'b' } },
			{ data: { id: 'c', label: 'c' } },
			{ data: { id: 'd', label: 'd' } },
			{ data: { id: 'e', label: 'e' } },
			{ data: { id: 'ae', weight: 1, source: 'a', target: 'e', label: '1' } },
			{ data: { id: 'ab', weight: 3, source: 'a', target: 'b', label: '3' } },
			{ data: { id: 'be', weight: 4, source: 'b', target: 'e', label: '4' } },
			{ data: { id: 'bc', weight: 5, source: 'b', target: 'c', label: '5' } },
			{ data: { id: 'ce', weight: 6, source: 'c', target: 'e', label: '6' } },
			{ data: { id: 'cd', weight: 2, source: 'c', target: 'd', label: '2' } },
			{ data: { id: 'de', weight: 7, source: 'd', target: 'e', label: '7' } },
			{ data: { id: 'ed', weight: 7, source: 'e', target: 'd', label: '7' } }
		]);
	} else if (dataset === 'mst') {
		cy.add([
			{ data: { id: '1', label: '1' } },
			{ data: { id: '2', label: '2' } },
			{ data: { id: '3', label: '3' } },
			{ data: { id: '4', label: '4' } },
			{ data: { id: '5', label: '5' } },
			{ data: { id: '6', label: '6' } },
			{ data: { id: '7', label: '7' } },
			{ data: { id: '8', label: '8' } },
			{ data: { id: '9', label: '9' } },
			{ data: { id: '12', weight: 4, source: '1', target: '2', label: '4' } },
			{ data: { id: '13', weight: 8, source: '1', target: '3', label: '8' } },
			{ data: { id: '25', weight: 8, source: '2', target: '5', label: '8' } },
			{ data: { id: '23', weight: 11, source: '2', target: '3', label: '11' } },
			{ data: { id: '34', weight: 7, source: '3', target: '4', label: '7' } },
			{ data: { id: '36', weight: 1, source: '3', target: '6', label: '1' } },
			{ data: { id: '45', weight: 2, source: '4', target: '5', label: '2' } },
			{ data: { id: '46', weight: 6, source: '4', target: '6', label: '6' } },
			{ data: { id: '57', weight: 4, source: '5', target: '7', label: '4' } },
			{ data: { id: '58', weight: 7, source: '5', target: '8', label: '7' } },
			{ data: { id: '67', weight: 2, source: '6', target: '7', label: '2' } },
			{ data: { id: '89', weight: 9, source: '8', target: '9', label: '9' } },
			{ data: { id: '87', weight: 14, source: '8', target: '7', label: '14' } },
			{ data: { id: '79', weight: 10, source: '7', target: '9', label: '10' } }
		]);
	} else if (dataset === 'shortest-path') {
		cy.add([
			{ data: { id: '1', label: '1' } },
			{ data: { id: '2', label: '2' } },
			{ data: { id: '3', label: '3' } },
			{ data: { id: '4', label: '4' } },
			{ data: { id: '5', label: '5' } },
			{ data: { id: '6', label: '6' } },
			{ data: { id: '12', weight: 2, source: '1', target: '2', label: '2' } },
			{ data: { id: '13', weight: 5, source: '1', target: '3', label: '5' } },
			{ data: { id: '25', weight: 10, source: '2', target: '5', label: '10' } },
			{ data: { id: '24', weight: 6, source: '2', target: '4', label: '6' } },
			{ data: { id: '35', weight: 8, source: '3', target: '5', label: '8' } },
			{ data: { id: '34', weight: 9, source: '3', target: '4', label: '9' } },
			{ data: { id: '46', weight: 4, source: '4', target: '6', label: '4' } },
			{ data: { id: '56', weight: 3, source: '5', target: '6', label: '3' } }
		]);
	} else if (dataset === 'strong-connected-components') {
		cy.add([
			{ data: { id: '1', label: '1' } },
			{ data: { id: '2', label: '2' } },
			{ data: { id: '3', label: '3' } },
			{ data: { id: '4', label: '4' } },
			{ data: { id: '5', label: '5' } },
			{ data: { id: '6', label: '6' } },
			{ data: { id: '7', label: '7' } },
			{ data: { id: '8', label: '8' } },
			{ data: { id: '12', weight: 1, source: '1', target: '2', label: '1' } },
			{ data: { id: '23', weight: 1, source: '2', target: '3', label: '1' } },
			{ data: { id: '24', weight: 1, source: '2', target: '4', label: '1' } },
			{ data: { id: '31', weight: 1, source: '3', target: '1', label: '1' } },
			{ data: { id: '34', weight: 1, source: '3', target: '4', label: '1' } },
			{ data: { id: '45', weight: 1, source: '4', target: '5', label: '1' } },
			{ data: { id: '54', weight: 1, source: '5', target: '4', label: '1' } },
			{ data: { id: '65', weight: 1, source: '6', target: '5', label: '1' } },
			{ data: { id: '67', weight: 1, source: '6', target: '7', label: '1' } },
			{ data: { id: '76', weight: 1, source: '7', target: '6', label: '1' } },
			{ data: { id: '78', weight: 1, source: '7', target: '8', label: '1' } },
			{ data: { id: '87', weight: 1, source: '8', target: '7', label: '1' } },
			{ data: { id: '85', weight: 1, source: '8', target: '5', label: '1' } }
		]);
	} else if (dataset === 'biconnected-components') {
		cy.add([
			{ data: { id: '1', label: '1' } },
			{ data: { id: '2', label: '2' } },
			{ data: { id: '3', label: '3' } },
			{ data: { id: '4', label: '4' } },
			{ data: { id: '5', label: '5' } },
			{ data: { id: '6', label: '6' } },
			{ data: { id: '7', label: '7' } },
			{ data: { id: '8', label: '8' } },
			{ data: { id: '9', label: '9' } },
			{ data: { id: '10', label: '10' } },
			{ data: { id: '11', label: '11' } },
			{ data: { id: '12', weight: 1, source: '1', target: '2', label: '1' } },
			{ data: { id: '13', weight: 1, source: '1', target: '3', label: '1' } },
			{ data: { id: '23', weight: 1, source: '2', target: '3', label: '1' } },
			{ data: { id: '24', weight: 1, source: '2', target: '4', label: '1' } },
			{ data: { id: '34', weight: 1, source: '3', target: '4', label: '1' } },
			{ data: { id: '45', weight: 1, source: '4', target: '5', label: '1' } },
			{ data: { id: '47', weight: 1, source: '4', target: '7', label: '1' } },
			{ data: { id: '56', weight: 1, source: '5', target: '6', label: '1' } },
			{ data: { id: '67', weight: 1, source: '6', target: '7', label: '1' } },
			{ data: { id: '610', weight: 1, source: '6', target: '10', label: '1' } },
			{ data: { id: '611', weight: 1, source: '6', target: '11', label: '1' } },
			{ data: { id: '78', weight: 1, source: '7', target: '8', label: '1' } },
			{ data: { id: '79', weight: 1, source: '7', target: '9', label: '1' } },
			{ data: { id: '89', weight: 1, source: '8', target: '9', label: '1' } }
		]);
	} else if (dataset === 'min-cut') {
		cy.add([
			{ data: { id: 's', label: 's' } },
			{ data: { id: 'v1', label: 'v1' } },
			{ data: { id: 'v2', label: 'v2' } },
			{ data: { id: 'v3', label: 'v3' } },
			{ data: { id: 'v4', label: 'v4' } },
			{ data: { id: 't', label: 't' } },
			{ data: { id: 'sv1', weight: 2, source: 's', target: 'v1', label: '2' } },
			{ data: { id: 'sv2', weight: 2, source: 's', target: 'v2', label: '2' } },
			{ data: { id: 'v1v3', weight: 2, source: 'v1', target: 'v3', label: '2' } },
			{ data: { id: 'v1v4', weight: 2, source: 'v1', target: 'v4', label: '2' } },
			{ data: { id: 'v2v4', weight: 2, source: 'v2', target: 'v4', label: '2' } },
			{ data: { id: 'v3t', weight: 2, source: 'v3', target: 't', label: '2' } },
			{ data: { id: 'v4s', weight: 4, source: 'v4', target: 's', label: '4' } },
			{ data: { id: 'v4t', weight: 1, source: 'v4', target: 't', label: '1' } }
		]);
	} else if (dataset === 'markov-clustering') {
		cy.add([
			{ data: { id: '1', label: '1' } },
			{ data: { id: '2', label: '2' } },
			{ data: { id: '3', label: '3' } },
			{ data: { id: '4', label: '4' } },
			{ data: { id: '5', label: '5' } },
			{ data: { id: '6', label: '6' } },
			{ data: { id: '7', label: '7' } },
			{ data: { id: '12', closeness: 1, source: '1', target: '2', label: '1' } },
			{ data: { id: '13', closeness: 1, source: '1', target: '3', label: '1' } },
			{ data: { id: '14', closeness: 1, source: '1', target: '4', label: '1' } },
			{ data: { id: '23', closeness: 1, source: '2', target: '3', label: '1' } },
			{ data: { id: '24', closeness: 1, source: '2', target: '4', label: '1' } },
			{ data: { id: '25', closeness: 1, source: '2', target: '5', label: '1' } },
			{ data: { id: '34', closeness: 1, source: '3', target: '4', label: '1' } },
			{ data: { id: '56', closeness: 1, source: '5', target: '6', label: '1' } },
			{ data: { id: '57', closeness: 1, source: '5', target: '7', label: '1' } },
			{ data: { id: '67', closeness: 1, source: '6', target: '7', label: '1' } }
		]);
	} else {
		const a: never = dataset;

		alert(a);
	}
};
