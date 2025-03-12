// Import chart modules
import BumpChart from './BumpChart.js';
import ScatterPlot from './ScatterPlot.js';
import BubbleChart from './BubbleChart.js';
import CircularHeatMap from './CircularHeatMap.js';
import ChoroplethMap from './ChoroplethMap.js';

//chart dimensions
const chartWidth = 800;
const chartHeight = 400;
const chartMargin = { top: 60, right: 60, bottom: 80, left: 80 };

let movies = await d3.json("data/movies_cleaned.json");

// Initialize charts
let bumpChart = new BumpChart('#bump-chart', chartWidth, chartHeight, chartMargin);
let scatterPlot = new ScatterPlot('#scatter-plot', chartWidth, chartHeight, chartMargin);
let bubbleChart = new BubbleChart('#bubble-chart', 1000, 500, chartMargin);
let circularHeatMap = new CircularHeatMap('#circular-heatmap', chartWidth, chartHeight, chartMargin);
let choroplethMap = new ChoroplethMap('#choropleth-map', 960, 500);

//render charts
bubbleChart.setLabels('Average Vote Score', 'Total Revenue').render(movies);