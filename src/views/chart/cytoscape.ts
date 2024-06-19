const selectedColor = '#1E90FF';
const highlightColor = '#3CB371';

export const nodeStyle = {
	'background-color': '#696969',
	'font-size': 12,
	color: '#696969',
	'border-width': 0,
	'border-color': selectedColor,
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
	'text-background-opacity': 0.5,
	'text-background-color': 'white',
	'text-background-padding': '5px',
	'color': '#808080',
	'text-margin-y': -14,
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
	'background-color': '#696969'
};

export const edgeSelectedStyle = {
	'line-color': selectedColor,
	'target-arrow-color': selectedColor,
	'color': selectedColor
};
