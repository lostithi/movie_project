export default class ChoroplethMap {
  constructor(container, width, height) {
    this.width = width;
    this.height = height;

    // Create an SVG inside the container
    this.svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("max-width", "100%")
      .style("height", "auto")
      .on("click", () => this.reset());  // Reset map on click

    // Create a group for the map elements
    this.g = this.svg.append("g");

    // Define zoom behavior (optimize zoom transformation logic)
    this.zoom = d3.zoom()
      .scaleExtent([1, 8])  // Min and max zoom levels
      .on("zoom", (event) => this.zoomed(event));

    // Define map projection
    this.projection = d3.geoNaturalEarth1()
      .scale(150)
      .translate([width / 2, height / 2]);

    // Define path generator
    this.path = d3.geoPath().projection(this.projection);

    // Apply zoom to the SVG
    this.svg.call(this.zoom);

    // Load and render the map
    this.loadMap();
  }

  loadMap() {
    // Use a reduced or simplified version of GeoJSON data for better performance
    d3.json("data/countries.geojson").then(geojson => {
      this.countries = this.g.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", this.path)
        .attr("fill", "#d3d3d3")
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .attr("cursor", "pointer")
        .on("click", (event, d) => this.clicked(event, d));

      // Add tooltips (hover over countries to see names)
      this.countries.append("title")
        .text(d => d.properties.name);
    });
  }

  // Optimized zoom handler (avoid transforming each path individually)
  zoomed(event) {
    const { transform } = event;
    this.g.attr("transform", transform);
    this.g.attr("stroke-width", 1 / transform.k);
  }

  // Reset map to default view
  reset() {
    this.countries.transition().style("fill", "#d3d3d3");
    this.svg.transition().duration(750).call(
      this.zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(this.svg.node()).invert([this.width / 2, this.height / 2])
    );
  }

  // Optimized click handler
  clicked(event, d) {
    const [[x0, y0], [x1, y1]] = this.path.bounds(d);

    event.stopPropagation();
    this.countries.transition().style("fill", "#d3d3d3");  // Reset all countries
    d3.select(event.target).transition().style("fill", "red");  // Highlight selected

    // Zoom to selected country
    this.svg.transition().duration(750).call(
      this.zoom.transform,
      d3.zoomIdentity
        .translate(this.width / 2, this.height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / this.width, (y1 - y0) / this.height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      d3.pointer(event, this.svg.node())
    );
  }
}
