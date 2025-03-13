export default class ChoroplethMap {
  constructor(container, width, height) {
    this.width = width;
    this.height = height;
    // Create SVG container
    this.svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Define projection and path generator
    const projection = d3.geoMercator()
      .scale(70)
      .center([0, 20])
      .translate([width / 2, height / 2]);
    const path = d3.geoPath().projection(projection);

    // Data and color scale
    const colorScale = d3.scaleThreshold()
      .domain([0, 2, 4, 6, 8, 10]) // This should be based on the vote_average range
      .range(d3.schemeBlues[7]);
      // .range(d3.schemeSet1);

    // Load the data asynchronously
    Promise.all([
      d3.json("data/world.geojson"),
      d3.json("data/movies_cleaned.json")
    ]).then(([topo, moviesData]) => {
      // Create a Map to hold average vote data for each country
      const data = new Map();
      // Process movie data
      moviesData.forEach(d => {
        // Loop through each production country
        d.production_countries.forEach(country => {
          // Get country code from country name (adjust as needed)
          const countryCode = this.getCountryCode(country); // Function to map country name to code
          if (countryCode) {
            if (!data.has(countryCode)) {
              data.set(countryCode, []);
            }
            data.get(countryCode).push(d.vote_average); // Store vote_average for each country
          }
        });
      });

      // Mouse over effect to highlight the country
      const mouseOver = function (event, d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", 0.5);

        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1)
          .style("stroke", "black");
      };
      const mouseLeave = function (event, d) {
        d3.selectAll(".Country")
          .transition()
          .duration(200)
          .style("opacity", 0.8);

        d3.select(this)
          .transition()
          .duration(200)
          .style("stroke", "blue");
      };
      // Draw the map and assign colors based on the movie data
      this.svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        .attr("d", path) // Set path using the projection
        .attr("fill", (d) => {
          const countryData = data.get(d.id) || [];
          const avgVote = countryData.length > 0 ? d3.mean(countryData) : 0; // Calculate average vote for the country
          return colorScale(avgVote); // Set the color based on average vote
        })
        .style("stroke", "transparent")
        .attr("cursor", "pointer")
        .attr("class", "Country")
        .on("mouseover", mouseOver)
        .on("mouseLeave", mouseLeave);
    }).catch((error) => {
      console.error("Error loading the data: ", error);
    });
  }

  // Helper function to map country name to country code
  getCountryCode(countryName) {
    const countryMapping = {
      "United States of America": "USA",
      "United Kingdom": "England",

      // Add more mappings as needed
    };
    return countryMapping[countryName] || null; // Return null if no match found
  }
}
