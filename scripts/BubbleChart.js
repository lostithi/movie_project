/**
 * Bubble chart class for genre performance analysis
 */
export default class BubbleChart {
    // Attributes
    width; height;
    svg; chart; bubbles; // selections 
    data; margin; // internal data 

    // scales
    scaleX; scaleY; scaleZ; scaleColor;
    // axis
    axisX; axisY;
    // labels
    labelX; labelY;

    // constructor
    constructor(container, width, height, margin) {
        this.width = width;
        this.height = height;
        this.margin = margin;

        this.svg = d3.select(container).append('svg')
            .classed('bubblechart', true)
            .attr('width', this.width)
            .attr('height', this.height);
            
        this.chart = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
            
        this.bubbles = this.chart.selectAll('circle.bubble');
        
        //axes selections
        this.axisX = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.height - this.margin.bottom})`);
            
        this.axisY = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // Add axis labels
        this.labelX = this.svg.append('text')
            .attr('transform', `translate(${this.width / 2}, ${this.height - 5})`)
            .style('text-anchor', 'middle');
            
        this.labelY = this.svg.append('text')
            .attr('transform', `translate(15, ${(this.height - this.margin.top - this.margin.bottom) / 2 + this.margin.top})rotate(-90)`)
            .style('text-anchor', 'middle');
    }

    // More processing of data structure for the chart
    processData(movies) {
        //explode data for multi-genre movies
        const expandedData = movies.flatMap(movie => 
            movie.genres.map(genre => ({
                genre,
                revenue: movie.revenue,
                voteAverage: movie.vote_average
            }))
        );

        // aggregate by genre
        const genreData = d3.flatRollup(
            expandedData,
            v => ({
                movieCount: v.length,
                totalRevenue: d3.sum(v, d => d.revenue),
                avgVote: d3.mean(v, d => d.voteAverage)
            }),
            d => d.genre
        );

        // convert to array for D3 binding
        return Array.from(genreData, ([genre, stats]) => ({ 
            genre, 
            movieCount: stats.movieCount,
            totalRevenue: stats.totalRevenue,
            avgVote: stats.avgVote
        }));
    }

    // Private methods
    #updateBubbles() {
      
        this.bubbles = this.bubbles
            .data(this.data, d => d.genre)
            .join('circle')
            .classed('bubble', true)
            .attr('cx', d => this.scaleX(d.avgVote))
            .attr('cy', d => this.scaleY(d.totalRevenue))
            .attr('r', d => this.scaleZ(d.movieCount))
            .attr('fill', d => this.scaleColor(d.genre));
            
        // title element as tooltips
        this.bubbles.append('title')
            .text(d => `${d.genre}
                Movies: ${d.movieCount}
                Avg Rating: ${d.avgVote.toFixed(1)}
                Total Revenue: ${d3.format("$,.0f")(d.totalRevenue)}`);
                
        // Interactions
        this.bubbles
            .on('mouseover', function(event) {
                d3.select(this).classed('highlighted', true);
            })
            .on('mouseout', function(event) {
                d3.select(this).classed('highlighted', false);
            })
            .on('click', (event, d) => {
                // Toggle highlight
                const isHighlighted = d3.select(event.currentTarget).classed('selected');
                
                // Reset all bubbles
                this.bubbles.classed('selected', false).classed('dimmed', false);
                
                if (!isHighlighted) {
                    // Highlight clicked bubble
                    d3.select(event.currentTarget).classed('selected', true);
                    
                    // Dim others
                    this.bubbles
                        .filter(node => node.genre !== d.genre)
                        .classed('dimmed', true);
                }
            });
    }

    #updateScales() {
        let chartWidth = this.width - this.margin.left - this.margin.right,
            chartHeight = this.height - this.margin.top - this.margin.bottom;
    
        let rangeX = [0, chartWidth],
            rangeY = [chartHeight, 0],
            rangeZ = [5, 40];
    
        let minVote = d3.min(this.data, d => d.avgVote) * 0.95; 
        let maxVote = d3.max(this.data, d => d.avgVote) * 1.05;
    
        let minRevenue = d3.min(this.data, d => d.totalRevenue);
        let maxRevenue = d3.max(this.data, d => d.totalRevenue);
        
        let domainX = [minVote, maxVote],
            domainY = [minRevenue, maxRevenue],
            domainZ = [0, d3.max(this.data, d => d.movieCount)];
                
        this.scaleX = d3.scaleLinear(domainX, rangeX);
        this.scaleY = d3.scaleLinear(domainY, rangeY);
        this.scaleZ = d3.scaleSqrt(domainZ, rangeZ);
        this.scaleColor = d3.scaleOrdinal(d3.schemeTableau10);  //need to check for a scale that can accomodate up to 20 colours
    }
    

    #updateAxes() {
        let axisGenX = d3.axisBottom(this.scaleX).ticks(7).tickFormat(d => d.toFixed(1)),
            axisGenY = d3.axisLeft(this.scaleY).ticks(5).tickFormat(d => d3.format("$.2s")(d));

        this.axisX.call(axisGenX);
        this.axisY.call(axisGenY);
    }

    // Public API
    render(movies) {
        this.data = this.processData(movies);
        this.#updateScales();
        this.#updateAxes();
        this.#updateBubbles();
        return this;
    }

    setLabels(labelX = 'Average Vote Score', labelY = 'Total Revenue') {
        this.labelX.text(labelX);
        this.labelY.text(labelY);
        return this;
    }
}