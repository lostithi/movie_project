
// Showing geographical details on the bottom 1,000 ranked movies by vote average)
// The map shows their countries of production.
// For each country, when a user hovers or selects a location on the map, it shows the following :
// - Country name
// - Average Movie Runtime(for movies produced in that country)
// - Least Rated Movie title
// - Total number of movies produced in that country 
// - Number of poorly rated movies produced in that country.

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
            .attr('fill', 'transparent')
            .style('cursor', 'default');

        // base country group
        this.mapGroup = this.svg.append('g')
            .classed('map', true);

        // tooltip for hover
        this.tooltip = d3.select(container)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // info for selected country initially hidden
        this.infoPanel = d3.select(container)
            .append("div")
            .attr("class", "info-panel");

        this.#setZoom();    // Initial zoom behavior
        this.selectedCountry = null;
        this.isZoomedToCountry = false; 
    }

    // base map render
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

    #processMovieData(movies) {
        const totalmoviesofall = {};
        movies.forEach(movie => {
            if (Array.isArray(movie.production_countries)) {
                movie.production_countries.forEach(country => {
                    totalmoviesofall[country] = (totalmoviesofall[country] || 0) + 1;
                });
            }
        });
        const bottomMovies = movies
            .sort((a, b) => a.vote_average - b.vote_average)
            .slice(0, 1000);
    
        // Mapping between the country and ISO codes
        const countryNameToId = {};
        this.regions.features.forEach(code => {
            if (code.properties && code.properties.name) {
                countryNameToId[code.properties.name] = code.id;
                // console.log(`${code.properties.name}: ${code.id}`);
            }            
        });
        const countryStats = {};    // forcountry processing
        bottomMovies.forEach(movie => {
            movie.production_countries.forEach(country => {
                if (!countryStats[country]) {
                    countryStats[country] = {
                        id: countryNameToId[country],
                        name: country,
                        totalMovies: 0,
                        totalVoteSum: 0,
                        totalRuntime: 0,
                        movies: [],
                        totalMoviesInData:totalmoviesofall[country] ||0
                    };
                }
                
                countryStats[country].totalMovies += 1;
                countryStats[country].totalVoteSum += movie.vote_average;
                countryStats[country].totalRuntime += movie.runtime || 0;
                
                countryStats[country].movies.push({
                    title: movie.title,
                    vote_average: movie.vote_average,
                    runtime: movie.runtime
                });
            });
        });
        
        // Calculate averages and least rated movies
        Object.values(countryStats).forEach(country => {
            country.avgVote = country.totalVoteSum / country.totalMovies;
            country.avgRuntime = country.totalRuntime / country.totalMovies;
            country.movies.sort((a, b) => a.vote_average - b.vote_average);
            country.leastRatedMovie = country.movies[0]?.title || 'Unknown';
            country.leastRatedScore = country.movies[0]?.vote_average || 'N/A';
        // console.log(country);  
        });
        console.log(countryStats);  
        return Object.values(countryStats);
    }

    #renderChoropleth() {
        const colorScale = d3.scaleSequential(d3.interpolatePlasma)
            .domain([
                d3.min(this.countryData, d => d.avgVote), 
                d3.max(this.countryData, d => d.avgVote)
            ]);
            console.log(this.countryData);
    
        this.mapGroup.selectAll('path.regions')
            .attr('fill', d => {
                const countryData = this.countryData.find(item => item.id === d.id);
                return countryData ? colorScale(countryData.avgVote) : 'grey';
            })

            .on('mouseover', (event, d) => {
                const path = d3.select(event.currentTarget);    //Target country path
                path.attr('stroke-width', 1.5)
                .attr('stroke', '#000');                
                const countryData = this.countryData.find(item => item.id === d.id);    //connects country using the ID
                if (countryData) {      //SELECTION and zoom fpr non included data countries handled  
                    this.tooltip
                        .style("opacity", 1)
                        .html(`
                        <div>
                        <h3>${countryData.name}</h3>
                        <div class="tooltip-grid">

                                <span>Total Movies:</span>
                                <span>${countryData.totalMoviesInData}</span>
                                
                                <span>Poorly rated Movies:</span>
                                <span>${countryData.totalMovies}</span>
                                
                                <span>Avg Runtime:</span>
                                <span>${Math.round(countryData.avgRuntime)} minutes</span>
                            
                                <span>Avg Rating:</span>
                                <span>${countryData.avgVote.toFixed(3)}</span>
                            
                                <span>Least Rated Movie:</span>
                                <span>"${countryData.leastRatedMovie}" (${countryData.leastRatedScore}/10)</span>
                                
                            </div>
                        </div>
                        `)
                        .style("left", (event.pageX + 15) + "px")   //Placement 
                        .style("top", (event.pageY - 30) + "px");
                }
            })
            .on('mouseout', (event, d) => {
                const path = d3.select(event.currentTarget);
                if (this.selectedCountry !== d.id) {
                    path.attr('stroke-width', 0.5).attr('stroke', '#333');
                }
                this.tooltip.style("opacity", 0);
            })
               
            .on('click', (event, d) => {
                const path = d3.select(event.currentTarget);
    
                if (this.selectedCountry) {         //one at a time selection
                    this.mapGroup.selectAll('path.regions')
                        .filter(region => region.id === this.selectedCountry)
                        .attr('stroke-width', 0.5)
                        .attr('stroke', '#333');
                }             
                this.selectedCountry = d.id;    //only selected new path 
                path.attr('stroke-width', 2).attr('stroke', '#000');
                
                const countryData = this.countryData.find(item => item.id === d.id);
                if (countryData && countryData.totalMovies > 0) {
                    this.infoPanel
                        .style("display", "none")
                        .html(`
                            <h3>${countryData.name}</h3>
                            <div class="info-grid">
                                <span>Total Movies:</span>
                                <span>${countryData.totalMoviesInData}</span>
                            
                                <span>Poorly rated Movies:</span>
                                <span>${countryData.totalMovies}</span>
                                
                                <span>Avg Runtime:</span>
                                <span>${Math.round(countryData.avgRuntime)} minutes</span>
                            
                                <span>Avg Rating:</span>
                                <span>${countryData.avgVote.toFixed(3)}</span>
                            
                                <span>Least Rated Movie:</span>
                                <span>"${countryData.leastRatedMovie}" (${countryData.leastRatedScore}/10)</span>
                            </div>
                        `);
                        this.zoomToCountry(d);
            } 
            });
    
        this.#createLegend(colorScale); 
    }    

    #setZoom() {
        this.zoom = d3.zoom()
            .extent([[0, 0], [this.width, this.height]])
            .translateExtent([[-(this.width * 0.4), -(this.height * 0.4)], [(this.width * 1.3), (this.height * 1.3)]])
            .scaleExtent([1, 8])
            .on('zoom', ({ transform }) => {
                // Applying transform tiogroup
                this.mapGroup.attr('transform', transform);
            });
        this.svg.call(this.zoom);
    
        this.background.on('click', () => {     // reset zoom on clicking background
            if (this.isZoomedToCountry) {   //Flag for check on zoomtoCountry and reset methods
                this.resetZoom();   
            }
        });
    }

    zoomToCountry(countryFeature) {    
        if (!countryFeature) return;
        const bounds = this.pathGen.bounds(countryFeature);     //ZOOMBOX
        const dx = bounds[1][0] - bounds[0][0];     //Country idth and height
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;        //Centre of the box
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        
        const scale = Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height));
        const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];        //Centering
        
        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,d3.zoomIdentity
                    .translate(translate[0], translate[1])
                    .scale(scale)
            );
        
        this.isZoomedToCountry = true;
    }

    resetZoom() {
        this.svg.transition()
            .duration(750)
            .call(
                this.zoom.transform,d3.zoomIdentity
            );
        
        this.isZoomedToCountry = false;
        this.clearSelection();  //DESELECT any selected countries on reste
    }

    #createLegend(colorScale) {  
        const legendWidth = 200;
        const legendHeight = 15;
        const legendPosition = {
            x: this.width - legendWidth - 590,
            y: this.height - 50
        };
        
        const legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`);
            
        //  gradient for the legend
        const defs = this.svg.append("defs");
        const linearGradient = defs.append("linearGradient")
                .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
            
        const minVote = d3.min(this.countryData, d => d.avgVote);
        const maxVote = d3.max(this.countryData, d => d.avgVote);
        for (let i = 0; i <= 10; i++) {
            const vote = minVote + (maxVote - minVote) * (i / 10);  //Interval calc for Gradient
            linearGradient.append("stop")
                .attr("offset", `${i * 10}%`)
                .attr("stop-color", colorScale(vote));
        }
        
        legend.append("rect")   //Rectangle for legend:)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
                .style("fill", "url(#legend-gradient)");
            
        legend.append("text")
            .attr("x", 0)
            .attr("y", -5)
            .style("font-size", "12px")
            .text(`Low Avg-Rating`);
            
        legend.append("text")
            .attr("x", legendWidth)
            .attr("y", -5)
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .text(`High`);
    }
    clearSelection() {  //Deselect a country when zooming out
        if (this.selectedCountry) {
            this.mapGroup.selectAll('path.regions')
                .filter(region => region.id === this.selectedCountry)
                .attr('stroke-width', 0.5)
                .attr('stroke', '#333');
            this.selectedCountry = null;    //reset
            this.infoPanel.style("display", "none");
        }
        return this;
    }
    
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
        // Renders a base map
        baseMap(regions = [], projection = d3.geoNaturalEarth1) {
            this.regions = regions;
            this.#renderMap(projection);
            return this;
        }
    
        // Renders a choropleth map
        renderChoropleth(movies) {
            this.countryData = this.#processMovieData(movies);
            this.#renderChoropleth();
            return this;
        }
}

