'use strict';

// Colors for the dots
const colors = {
    "Bug": "#4E79A7",
    "Dark": "#A0CBE8",
    "Electric": "#F28E2B",
    "Fairy": "#FFBE&D",
    "Fighting": "#59A14F",
    "Fire": "#8CD17D",
    "Ghost": "#B6992D",
    "Grass": "#499894",
    "Ground": "#86BCB6",
    "Ice": "#86BCB6",
    "Normal": "#E15759",
    "Poison": "#FF9D9A",
    "Psychic": "#79706E",
    "Steel": "#BAB0AC",
    "Water": "#D37295"
}

// Defines constraints for visualization
const constraints = {
    margin: {left: 50, right: 20, top: 10, bottom: 50},
    width: 500,
    height: 500
};

const attributes = {
    x: "Sp. Def",
    y: "Total"
}

let scaleFunc = {
    x: null,
    y: null
};

let visContainer;

generateSVG(); // Appends svg container
d3.csv("./data/pokemon.csv", generateVisualization);

// Generates a scatterplot visualization of the given data
function generateVisualization(data) {
    console.log(data);
    calculateScaling(data);
    // Generate foundation of graph
    generateDropdowns(data);
    generateAxis();
    generateLabels();
    generateLegend();
    plotPoints(data);

}

// Generate the legend of the visualization
function generateLegend() {
    const legendMeasure = { height: 400, width: 100 }
    let legendSVG = d3.select("#legend").append("svg")
        .attr("width", legendMeasure.width + "px")
        .attr("height", legendMeasure.height + "px")
        .append("g")
            .attr("transform", "translate(-90, -80)")

    var color = d3.scaleOrdinal()
        .domain(Object.keys(colors));
    legendSVG.selectAll("mydots")
        .data(Object.keys(colors))
        .enter()
        .append("circle")
            .attr("cx", 100)
            .attr("cy", function(d,i){ return 100 + i*25}) 
            .attr("r", 7)
            .style("fill", function(d){ return colors[d]})

    // Add one dot in the legend for each name.
    legendSVG.selectAll("mylabels")
        .data(Object.keys(colors))
        .enter()
        .append("text")
            .attr("x", 120)
            .attr("y", function(d,i){ return 100 + i*25}) 
            .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
}

// Generate visualization labels
function generateLabels() {
    visContainer
        .append("text")
        .attr('x', constraints.width / 3)
        .attr('y', constraints.height + 30)
        .style('font-size', '10pt')
        .text('Sp. Def');
    visContainer
        .append("text")
        .attr('x', 10)
        .attr('y', -50)
        .attr('transform', 'translate(15, 300)rotate(-90)')
        .style('font-size', '10pt')
        .text('Total');
}

// Plot the given data on the scatterplot
function plotPoints(data) {
    let points = visContainer.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", (d) => { return scaleFunc.x(d[attributes.x]) })
            .attr("cy", (d) => { return scaleFunc.y(d[attributes.y]) })
            .attr("r", 3)
            .attr("fill", (d) => { return colors[d["Type 1"]] })
            .attr("data-legend",function(d) { return d["Type 1"]});
    createHover(points);
    
    d3.select("#generation")
        .on("change", function() {
            updatePlot(data);
        });
    d3.select("#legendary")
        .on("change", function() {
            updatePlot(data);
        });
    
}

// Updates the plot with the given data
function updatePlot(data) {
    let filteredData = applyFilter(data);
            
    visContainer.selectAll("circle").remove();
    let newCirclesWData = visContainer.selectAll("circle")
        .data(filteredData)
        .enter()
        .append("circle")
            .attr("cx", (d) => { return scaleFunc.x(d[attributes.x]) })
            .attr("cy", (d) => { return scaleFunc.y(d[attributes.y]) })
            .attr("r", 3)
            .attr("fill", (d) => { return colors[d["Type 1"]] });
    createHover(newCirclesWData);
}

// Returns a filtered dataset of the given data
function applyFilter(data) {

    let legendValue = document.querySelector("#legendary").value;
    let genValue = document.querySelector("#generation").value;

    let filteredData = data.filter((d) => {
        if (genValue == "All" && legendValue == "All") {
            return true;
        } else if (genValue != "All" && legendValue != "All") {
            return d.Generation == genValue && d.Legendary == legendValue;
        } else if (legendValue == "All") {
            return d.Generation == genValue;
        } else {
            return d.Legendary == legendValue;
        }
    });
    return filteredData;
}

// Creates tooltip for the given points
function createHover(points) {
    let tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    points
        .on("mouseover", (content) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1)
            tooltip.html("<p>" + content.Name + "<br />" + 
                content["Type 1"] + "<br />" + 
                content["Type 2"] + "</p>")
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0)
        });
}

// Generates the SVG container for the visualization
function generateSVG() {
    visContainer = d3.select("#vis").append("svg")
        .attr("width", constraints.width + constraints.margin.left + constraints.margin.right + "px")
        .attr("height", constraints.height + constraints.margin.top + constraints.margin.bottom + "px")
        .append("g")
            .attr("transform", "translate(" + constraints.margin.left + ", " + constraints.margin.top + ")");
}

// Generates the y and x axis for the scatterplot
function generateAxis() {
    visContainer.append("g")
        .attr("transform", "translate(0," + constraints.height + ")")
        .call(d3.axisBottom(scaleFunc.x))
    visContainer.append("g")
        .call(d3.axisLeft(scaleFunc.y))
}

// Generates the dropdown options with the given data
function generateDropdowns(data) {
    let generations = ["All"];
    let legendary = ["All"];
    data.forEach((point) => { 
        if (generations.indexOf(point.Generation) == -1) {
            generations.push(point.Generation);
        }
        if (legendary.indexOf(point.Legendary) == -1) {
            legendary.push(point.Legendary)
        }
    });
    d3.select("#legendary")
        .selectAll("option")
        .data(legendary)
        .enter()
        .append("option")
        .text((d) => { return d })
        .attr("value", (d) => { return d })
    d3.select("#generation")
        .selectAll("option")
        .data(generations)
        .enter()
        .append("option")
        .text((d) => { return d })
        .attr("value", (d) => { return d });
}

// Calculates and creates the scaling function of the data
// with the given data
function calculateScaling(data) {
    let x = data.map((point) => { return point[attributes.x] });
    let y = data.map((point) => { return point[attributes.y] });

    let domain = {
        xMax: Math.max(...x),
        xMin: Math.min(...x),
        yMax: Math.max(...y),
        yMin: Math.min(...y)
    };

    scaleFunc.x = d3.scaleLinear()
                  .domain([domain.xMin - 20, domain.xMax])
                  .range([0, constraints.width]);
    scaleFunc.y = d3.scaleLinear()
                  .domain([domain.yMin, domain.yMax])
                  .range([constraints.height, 0]);
}

