import './style.css';
import * as d3 from 'd3';

/**
 * Holder object for box visualization
 */
let boxData = {};
let moveSimData = [];
const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

/**
 * Draw rectangles based on the provided data.
 * @param {Object[]} data - The data to be visualized.
 */
function drawRectangles(data) {
  const boxSize = 90;
  const spacing = 92;

  const svg = d3.select('#canvas');

  const group = svg
    .selectAll('g')
    .data(Object.values(boxData))
    .enter()
    .append('g')
    .attr('x', (d) => d.column * spacing)
    .attr('y', (d) => d.row * spacing);

  group
    .append('rect')
    .attr('width', boxSize)
    .attr('height', boxSize)
    .attr('x', (d) => d.column * spacing)
    .attr('y', (d) => d.row * spacing)
    .attr('fill', (d) => d.color)
    .attr('id', (d) => d.label)
    .on('mouseover', (event, data) => showTooltip(event, data))
    .on('mouseout', () => hideTooltip());

  group
    .append('text')
    .attr('x', (d) => d.column * spacing + 8) // Adjust position based on rectangle width
    .attr('y', (d) => d.row * spacing + 20) // Adjust position based on rectangle height
    .attr('text-anchor', 'left')
    .attr('alignment-baseline', 'top')
    .attr('fill', 'black')
    .attr('id', (d) => `t-${d.label}`)
    .text((d) => d.label);

  svg
    .append('rect')
    .attr('width', boxSize)
    .attr('height', boxSize)
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill', 'green')
    .attr('stroke', 'black')
    .attr('stroke-width', '3')
    .attr('fill-opacity', '0.2')
    .attr('style', 'stroke: green')
    .attr('id', 'robot');

  /**
   * Show tooltip on mouseover.
   * @param {Object} event - Data of the hovered rectangle.
   */
  function showTooltip(event, data) {
    const tooltip = d3.select('.tooltip');

    tooltip
      .html(data.label)
      .style('left', event.clientX + window.scrollX + 10 + 'px')
      .style('top', event.clientY + window.scrollY - 10 + 'px')
      .style('display', 'block');
  }

  /**
   * Hide tooltip on mouseout.
   */
  function hideTooltip() {
    const tooltip = d3.select('.tooltip');
    tooltip.style('display', 'none');
  }
}

const movesim = () => {
  let step = moveSimData.shift();
  if (!step) {
    alert('End of the line');
    return false;
  }
  move(step);
  return true;
};

const animatesim = () => {
  if (movesim()) {
    setTimeout(animatesim, 100);
  }
};

const move = (step) => {
  let box = boxData[step.id];
  box.row += step.d.x;
  box.column += step.d.y;
  if (box.row == 0 && box.column == 0) {
    box.color = '#CCFFCC';
  }
  resetSVG();
  drawRectangles(boxData);
};

const resetSVG = () => {
  let svg = document.getElementById('canvas');
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
};

/**
 * Setup the SVG to fill the screen
 */
const initSVG = () => {
  let actualSize = document.documentElement.clientWidth;
  d3.select('#app')
    .append('svg')
    .attr('id', 'canvas')
    .attr('viewBox', '0 0 1100 1100')
    .attr('width', actualSize)
    .attr('height', actualSize);
};

const fetchData = () =>
  new Promise((resolve, _reject) => {
    // Starting point
    let startingPoint = {
      row: 0,
      column: 0,
      age: 0,
      color: '#CCCCFF',
      label: 'Dock',
      id: 'loaddock'
    };
    boxData[startingPoint.label] = startingPoint;

    // Transport Rail
    for (let i = 1; i <= 10; i++) {
      const newIdAndLabel = `runway${i}`;
      const runway = {
        row: i,
        column: 0,
        age: 0,
        color: 'lightgray',
        label: newIdAndLabel,
        id: newIdAndLabel
      };
      boxData[runway.id] = runway;
    }

    // Fake data
    for (let i = 1; i <= 10; i++) {
      for (let j = 1; j <= 10; j++) {
        const datum = makeBox(i, j);
        if (i === 1) {
          datum.label = '';
          datum.color = '#CCCCFF';
        }
        boxData[datum.id] = datum;
      }
    }

    moveOneRow(10, 1);
    moveOneRow(2, 10);
    moveOneRow(9, 2);
    moveOneRow(3, 9);
    moveOneRow(8, 3);
    moveOneRow(4, 8);
    moveOneRow(7, 4);
    moveOneRow(5, 7);
    moveOneRow(6, 5);

    resolve();
  });

const moveOneRow = (moveRow, targetRow) => {
  const dir = {
    right: { x: 0, y: 1 },
    left: { x: 0, y: -1 },
    up: { x: -1, y: 0 },
    down: { x: 1, y: -0 }
  };

  for (let i = 1; i <= 10; i++) {
    let id = `${labels[moveRow - 1]}_${labels[i - 1]}`;
    moveOneObject(dir, id, targetRow, 11 - i);
  }
};

const moveOneObject = (dir, objId, targetRow, targetColumn) => {
  const box = boxData[objId];
  const x = box.row;
  const y = box.column;

  // Move to Dock
  for (let i = 0; i < y; i++) {
    moveSimData.push(makeMoveObject(objId, dir.left));
  }
  for (let i = 0; i < x; i++) {
    moveSimData.push(makeMoveObject(objId, dir.up));
  }

  // Movet to target row
  for (let i = 0; i < targetRow; i++) {
    moveSimData.push(makeMoveObject(objId, dir.down));
  }

  for (let i = 0; i < targetColumn; i++) {
    moveSimData.push(makeMoveObject(objId, dir.right));
  }
};

const makeMoveObject = (id, dir) => {
  return {
    id: id,
    d: {
      x: dir.x,
      y: dir.y
    }
  };
};

const makeBox = (i, j) => {
  const newIdAndLabel = `${labels[i - 1]}_${labels[j - 1]}`;
  const newColor = `rgba(255, 0, 0, ${(2 * i) / 20})`;
  return {
    row: i,
    column: j,
    age: 2 * j,
    color: newColor,
    label: newIdAndLabel,
    id: newIdAndLabel
  };
};

/**
 * Setup event hooks and initial draw
 */
const bootstrap = async () => {
  document.getElementById('btnMove').addEventListener('click', (event) => {
    event.preventDefault();
    movesim();
  });

  document.getElementById('btnAnimate').addEventListener('click', (event) => {
    event.preventDefault();
    animatesim();
  });
  initSVG();
  await fetchData();
  drawRectangles(boxData);
};

/**
 * Call bootstrap when ready
 */
if (document.readyState != 'loading') {
  bootstrap();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
  });
}
