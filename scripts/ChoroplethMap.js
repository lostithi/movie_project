<<<<<<< HEAD
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
=======
export default class ChoroplethMap {
    constructor(container, width, height) {
        this.width = width;
        this.height = height;

        this.svg = d3.select(container)
            .append('svg')
            .classed('map', true)
            .attr('width', width)
            .attr('height', height);

        // Create a background rect for reset zoom
        this.background = this.svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent');

        // base country group
        this.mapGroup = this.svg.append('g')
            .classed('map', true);

        // tooltip for hover
        this.tooltip = d3.select(container)
            .append("div")
            .attr("class", "tooltip");

        // info for selected country initially hidden
        this.infoPanel = d3.select(container)
            .append("div")
            .attr("class", "info-panel");

        this.#setZoom();    // Initial zoom behavior
        this.selectedCountry = null;
        this.isZoomedToCountry = false;
    }

    // Function for zoom behavior
    #setZoom() {
        this.zoom = d3.zoom()
            .extent([[0, 0], [this.width, this.height]])
            .translateExtent([[-this.width, -this.height], [this.width * 2, this.height * 2]])
            .scaleExtent([1, 8])
            .on('zoom', ({ transform }) => {
                // Applying transform to group
                this.mapGroup.attr('transform', transform);
            });
        this.svg.call(this.zoom);
        
        // reset zoom on clicking background
        this.background.on('click', () => {
            if (this.isZoomedToCountry) {
                this.resetZoom();
            }
        });
    }

    // Function to zoom to a specific country
    zoomToCountry(countryFeature) {
        if (!countryFeature) return;
        
        // Zoom bounding box of a country
        const bounds = this.pathGen.bounds(countryFeature);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        
        const scale = Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height));
        const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];
        
        // Apply the transformation with a transition
        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,
                d3.zoomIdentity
                    .translate(translate[0], translate[1])
                    .scale(scale)
            );
        
        this.isZoomedToCountry = true;
    }

    // Function to reset zoom 
    resetZoom() {
        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,
                d3.zoomIdentity
            );
        
        this.isZoomedToCountry = false;
        this.clearSelection();  // DESELECT any selected countries
    }

    // base map render
>>>>>>> 4c8e5e8 (chromo file update)
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
<<<<<<< HEAD
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
=======

    // Movie data to country statistics mapping
    #processMovieData(movies) {
        // Mapping between country names and ISO codes.
        const countryNameToId = {};
        this.regions.features.forEach(feature => {
            if (feature.properties && feature.properties.name) {
                countryNameToId[feature.properties.name] = feature.id;
            }            
        });
        // Data for each country processed here
        const countryStats = {};
        
        movies.forEach(movie => {
            movie.production_countries.forEach(country => {
                if (!countryStats[country]) {
                    countryStats[country] = {
                        id: countryNameToId[country],
                        name: country,
                        totalMovies: 0,
                        totalRuntime: 0,
                        poorlyRatedMovies: 0,
                        movies: [],
                        value: 0 // This will be the count of movies for choropleth coloring
                    };
                }
                
                countryStats[country].totalMovies += 1;
                countryStats[country].value += 1;
                countryStats[country].totalRuntime += movie.runtime || 0;
                
                // Assuming poorly rated movies are those with vote_average < 5
                if (movie.vote_average < 5) {
                    countryStats[country].poorlyRatedMovies += 1;
                }
                
                countryStats[country].movies.push({
                    title: movie.title,
                    vote_average: movie.vote_average,
                    runtime: movie.runtime
                });
            });
        });
        
        // Calculate averages and find least rated movie
        Object.values(countryStats).forEach(country => {
            country.avgRuntime = country.totalRuntime / country.totalMovies;
            country.movies.sort((a, b) => a.vote_average - b.vote_average);
            country.leastRatedMovie = country.movies[0]?.title || 'Unknown';
            country.leastRatedScore = country.movies[0]?.vote_average || 'N/A';
        });
        
        return Object.values(countryStats);
    }

    #renderChoropleth() {
        const self = this;
        
        // Color scale 
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, d3.max(this.countryData, d => d.value)]);
        
        console.log(this.countryData);
        
        // Bind data to regions and apply color based on value
        this.mapGroup.selectAll('path.regions')
            .attr('fill', d => {
                const countryData = this.countryData.find(item => item.id === d.id);
                return countryData ? colorScale(countryData.value) : '#ccc'; // Default color for missing data
            })
            .on('mouseover', function(event, d) {
                // Highlight country
                d3.select(this)
                    .classed('highlighted', true);
                
                const countryData = self.countryData.find(item => item.id === d.id);
                if (countryData) {
                    self.tooltip
                        .style("opacity", 0.9)
                        .html(`
                            <strong>${countryData.name}</strong><br/>
                            Total Movies: ${countryData.totalMovies}<br/>
                            Average Runtime: ${Math.round(countryData.avgRuntime)} min
                        `)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 30) + "px");
                }
            })
            .on('mouseout', function() {
                // Remove highlight if not the selected country
                if (self.selectedCountry !== d3.select(this).datum().id) {
                    d3.select(this).classed('highlighted', false);
                }
                self.tooltip.style("opacity", 0);
            })
            .on('click', function(event, d) {
                event.stopPropagation(); // Prevent the click from bubbling to the background
                
                // Deselect previous country
                if (self.selectedCountry) {
                    self.mapGroup.selectAll('path.regions')
                        .filter(region => region.id === self.selectedCountry)
                        .classed('selected', false);
                }
                
                // Select new country
                self.selectedCountry = d.id;
                d3.select(this).classed('selected', true);
                
                const countryData = self.countryData.find(item => item.id === d.id);
                if (countryData) {
                    self.infoPanel
                        .style("display", "block")
                        .html(`
                            <h3>${countryData.name}</h3>
                            <p><strong>Total Movies:</strong> ${countryData.totalMovies}</p>
                            <p><strong>Poorly Rated Movies:</strong> ${countryData.poorlyRatedMovies}</p>
                            <p><strong>Average Runtime:</strong> ${Math.round(countryData.avgRuntime)} minutes</p>
                            <p><strong>Least Rated Movie:</strong> "${countryData.leastRatedMovie}" (${countryData.leastRatedScore}/10)</p>
                        `);
                    
                    // Zoom to the selected country
                    self.zoomToCountry(d);
                } else {
                    self.infoPanel.style("display", "none");
                }
            });
            
        // Add a legend
        this.#createLegend(colorScale);
    }
    
    // Legend for the map
    #createLegend(colorScale) {  
        const legendWidth = 200;
        const legendHeight = 15;
        const legendPosition = {
            x: this.width - legendWidth - 20,
            y: this.height - 50
        };
        
        const legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`);
            
        // Create a linear gradient for the legend
        const defs = this.svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
            
        // Set the color stops
        const max = d3.max(this.countryData, d => d.value);
        for (let i = 0; i <= 10; i++) {
            linearGradient.append("stop")
                .attr("offset", `${i * 10}%`)
                .attr("stop-color", colorScale(max * i / 10));
        }
        
        // Draw the rectangle with the gradient
        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");
            
        // Add annotations
        legend.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .style("text-anchor", "start")
            .text("Few Movies");
            
        legend.append("text")
            .attr("x", legendWidth)
            .attr("y", -5)
            .style("text-anchor", "end")
            .text("Many Movies");
            

    }

    // Renders a base (background) map
    baseMap(regions = [], projection = d3.geoNaturalEarth1) {
        this.regions = regions;
        this.#renderMap(projection);
        return this;
    }

    // Renders a choropleth map
    renderChoropleth(movies) {
        this.rawMovies = movies;
        this.countryData = this.#processMovieData(movies);
        this.#renderChoropleth();
        return this;
    }
    
    // Method to clear selection
    clearSelection() {
        if (this.selectedCountry) {
            this.mapGroup.selectAll('path.regions')
                .filter(region => region.id === this.selectedCountry)
                .classed('selected', false);
                
            this.selectedCountry = null;
            this.infoPanel.style("display", "none");
        }
        return this;
    }
    
    // Method to update data
    updateData(movies) {
        this.clearSelection();
        this.renderChoropleth(movies);
        return this;
    }
    
    // Method to resize the map
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        this.svg
            .attr('width', width)
            .attr('height', height);
        
        this.background
            .attr('width', width)
            .attr('height', height);
            
        this.projection
            .fitSize([width, height], this.regions);
            
        this.mapGroup.selectAll('path.regions')
            .attr('d', this.pathGen);
            
        return this;
    }
}
>>>>>>> 4c8e5e8 (chromo file update)
