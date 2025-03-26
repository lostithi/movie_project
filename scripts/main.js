
import ChoroplethMap from './ChoroplethMap.js';

//chart dimensions
const chartWidth = 800;
const chartHeight = 450;
const chartMargin = { top: 60, right: 60, bottom: 80, left: 80 };
const bumpMargin = { top: 30, right: 60, bottom: 50, left: 80 };

let movies = await d3.json('data/movies_cleaned.json');

let choroplethMap = new ChoroplethMap('#choropleth-map', chartWidth, chartHeight);

// highlighting the line corresponding to the genre
const highlightGenre = (e,d)=>{
    bumpChart.highlightLines([d.genre]);
}
// removing the hover effect
const rmvHighlightGenre = () => {
    bumpChart.highlightLines([]);
};



//choropleth
let topoData = await d3.json('./data/countries-50m.json');
let ithimovies = await d3.json("data/ithi_movies_cleaned.json");
let countries = topojson.feature(topoData, topoData.objects.countries);
console.log(countries);  // Check the structure

// Initialize and render the choropleth map
choroplethMap
    .baseMap(countries, d3.geoNaturalEarth1)
    .renderChoropleth(ithimovies); // Passing the ithimovies data to the renderChoropleth method
