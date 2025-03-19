export default class ChoroplethMap{
    constructor(container, width, height){
        this.width = width;
        this.height = height;

    // svg
    this.svg = d3.select(container)
        .append('svg')
        .classed('map', true)
        .attr('width', width)
        .attr('height', height)

    // base map
    this.mapGroup = this.svg.append('g')
        .classed('map', true);

    this.#setZoom();

    }

    // Function to set the zoom behavior
    #setZoom() {
        this.zoom = d3.zoom()
            .extent([[0, 0], [this.width, this.height]])
            .translateExtent([[0, 0], [this.width, this.height]])
            .scaleExtent([1, 8])
            .on('zoom', ({ transform }) => {
                // Apply transform to the map group
                this.mapGroup.attr('transform', transform);
            });
        this.svg.call(this.zoom);
    }

    // Function to render the base map
    #renderMap(projection) {
        this.projection = projection()
            .fitSize([this.width, this.height], this.regions);
        this.pathGen = d3.geoPath()
            .projection(this.projection);

        // Draw the regions (countries)
        this.mapGroup.selectAll('path.regions')
            .data(this.regions.features)
            .join('path')
            .classed('regions', true)
            .attr('d', this.pathGen);
    }
    //    Function to render the choropleth map
        #renderChoropleth() {
            // Create a color scale for the choropleth
            const colorScale = d3.scaleSequential(d3.interpolateBlues)
                .domain([0, d3.max(this.data, d => d.value)]);
    
            // Bind data to regions and apply color based on value
            this.mapGroup.selectAll('path.regions')
                .attr('fill', d => {
                    const countryData = this.data.find(item => item.id === d.id);
                    return countryData ? colorScale(countryData.value) : '#ccc';    // Default color for missing data
                });
        }

        #processData(){
            let movieList = await d3.json("data/ithi_movies_cleaned.json");
            let sortedMovies = ithimovies.sort((a,b) => a.vote_average - b.vote_average).slice(0, 1000);    //Sorting and getting bottom 1000
            console.log(sortedMovies);
            let movieByCountry = {};
            sortedMovies.forEach(i => {
                let countryList = ithimovies.production_countries.map(d => d.title);
                countries.forEach(country) => {
                    if(!movieByCountry[country]){
                        movieByCountry[country] = {
                            name: country,
                            totalMovies: 0,
                            poorlyRatedMovies: 0,
                            totalRuntime: 0,
                            leastRatedMovie: { title: movie.title, vote: movie.vote_average },
                        };
                    }
                }
            });

        }

        
        // Renders a base (background) map
        baseMap(regions = [], projection = d3.geoNaturalEarth) {
            this.regions = regions;
            this.#renderMap(projection);
            return this;
        }

        // Renders a choropleth map
        renderChoropleth(dataset) {
            this.data = ithimovies;
            this.#renderChoropleth();
            return this;
        }
}
