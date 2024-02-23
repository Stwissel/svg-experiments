import './style.css';
import * as d3 from 'd3';

/**
 * Draw rectangles based on the provided data.
 * @param {Object[]} data - The data to be visualized.
 */
function drawRectangles(data) {
  const svg = d3
    .select('#app')
    .append('svg')
    .attr('width', 850)
    .attr('height', 850);

  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('width', 75)
    .attr('height', 75)
    .attr('x', (d) => (d.column - 1) * 85) // Adjust 35 based on your desired gap
    .attr('y', (d) => (d.row - 1) * 85) // Adjust 35 based on your desired gap
    .attr('fill', (d) => `rgba(255, 0, 0, ${d.age / 20})`)
    .attr('id', (d) => d.label)
    .on('mouseover', (event, data) => showTooltip(event, data))
    .on('mouseout', () => hideTooltip());

  d3.select('#Data-f-e').attr('fill', 'blue');

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

// Sample data
const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
const data = [];

for (let i = 1; i <= 10; i++) {
  for (let j = 1; j <= 10; j++) {
    const datum = {
      row: i,
      column: j,
      age: 2 * j,
      label: `Data-${labels[i - 1]}-${labels[j - 1]}`
    };
    data.push(datum);
  }
}

// Draw rectangles using the provided data
drawRectangles(data);
