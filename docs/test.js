//initilize svg or grab svg
const svg = d3.select("svg");
const width = svg.attr("width");
const height = svg.attr("height");

// Specify the color scale.
const color = d3.scaleOrdinal(d3.schemeCategory10);

    
const graphData = {
  links: [
    {source: "Web Technologies", target: "Mark L1", type: "level"},
    {source: "Web Technologies", target: "WT L2", type: "level"},
    {source: "Web Technologies", target: "WT L3", type: "level"},

    {source: "Mark L1", target: "CARMA", type: "core"},
    {source: "Mark L1", target: "INDAD", type: "core"},
    {source: "Mark L1", target: "INTPROG", type: "core"},
    {source: "Mark L1", target: "NETFUN", type: "core"},
    {source: "Mark L1", target: "WEBF1", type: "core"},

    {source: "WT L2", target: "ADPROC", type: "core"},
    {source: "WT L2", target: "GUDE", type: "core"},
    {source: "WT L2", target: "WEPM", type: "core"},
    {source: "WT L2", target: "WEBF2", type: "core"},
    {source: "WT L2", target: "WEBSCPR", type: "core"},
    {source: "WT L2", target: "COSINE", type: "optional"},
    {source: "WT L2", target: "DSALG", type: "optional"},
    {source: "WT L2", target: "DBPRIN", type: "optional"},

    {source: "WT L3", target: "ENTWA", type: "core"},
    {source: "WT L3", target: "WEBRES", type: "core"},
    {source: "WT L3", target: "PJE40", type: "core"},
    {source: "WT L3", target: "ADCON12", type: "optional"},
    {source: "WT L3", target: "ADNET", type: "optional"},
    {source: "WT L3", target: "DWM", type: "optional"},
    {source: "WT L3", target: "DISPARP", type: "optional"},
    {source: "WT L3", target: "FLOTA", type: "optional"},
    {source: "WT L3", target: "NETSOC", type: "optional"},

    {source: "Software Engineering", target: "Mark L1", type: "level"},
    {source: "Software Engineering", target: "SE L2", type: "level"},
    {source: "Software Engineering", target: "SE L3", type: "level"},

    {source: "SE L2", target: "3DCGAA", type:"optional"},
    {source: "SE L2", target: "ADPROC", type:"core"},
    {source: "SE L2", target: "U22732", type:"core"},
    {source: "SE L2", target: "COSINE", type:"optional"},
    {source: "SE L2", target: "DSALG", type:"core"},
    {source: "SE L2", target: "DBPRIN", type:"optional"},
    {source: "SE L2", target: "MATHFUN", type:"core"},
    {source: "SE L2", target: "GUDE", type:"core"},
    {source: "SE L2", target: "INSE", type:"core"},
    {source: "SE L2", target: "WEBSCPR", type:"optional"},

    {source: "SE L3", target: "ASE", type:"core"},
    {source: "SE L3", target: "DWM", type:"optional"},
    {source: "SE L3", target: "DISPARP", type:"optional"},
    {source: "SE L3", target: "PJE40", type:"core"},
    {source: "SE L3", target: "FLOTA", type:"optional"},
    {source: "SE L3", target: "NENGA", type:"optional"},
    {source: "SE L3", target: "PARD", type:"optional"},
    {source: "SE L3", target: "RASS", type:"core"},
    {source: "SE L3", target: "WEBRES", type:"optional"},

    {source: "Web Technologies", target: "Software Engineering", type: "hidden"}
  ]
};


graphData.nodes = extractNodes(graphData);

const simulation = d3
  .forceSimulation(graphData.nodes)
  .force("charge", d3.forceManyBody().strength(-300))
  
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide().strength([1]))
  .force("link", d3.forceLink(graphData.links).id(d => d.name))
  .on("tick", ticked);

const links = svg
  .append("svg:g")
  .selectAll("line")
  .data(graphData.links)
  .enter()
  .append("svg:line")
  .attr("class", function(d) { return "link " + d.type; })
  .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
  // .attr("stroke-width", 1.5)
  // .style("stroke", "orange");

const drag = d3
  .drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

const textNode = svg
  .append("g")
  .selectAll("g")
  .data(graphData.nodes)
  .enter()
  .append("g")
  .call(drag);


const rectangles = textNode
  .attr("stroke-width", 5)
  // .style("stroke", "#fff")
  .append('rect')
  .attr('width', 50)
  .attr('height', 25)
  .attr("fill",d => color(d.group))
  .append("circle")
  .attr("r", 5)
  .attr("fill","black");



  
const finalNode = textNode
  .append("circle")
  .attr("r", 5)
  .attr("fill","black");

const texts = textNode
  .append("text")
  .text(d => d.name);

    
    
function extractNodes(graphData) {
  let nodeSet = new Set();
  graphData.links.forEach(link => {
    nodeSet.add(link.source);
    nodeSet.add(link.target);
  });
  const nodes = Array.from(nodeSet).map(node => {
    return { name: node };
  });
  return nodes
}

function ticked() {
  textNode.attr("transform", d => `translate(${d.x},${d.y})`);
  links
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);
}

function dragstarted(d) {
  if (!d.active) simulation.alphaTarget(0.3).restart();
  //your alpha hit 0 it stops! make it run again
  // simulation.alphaTarget(0.3).restart();
  d.subject.fx = d.subject.x;
  d.subject.fy = d.subject.y;
}

function dragged(d) {
  d.subject.fx = d.x;
  d.subject.fy = d.y;
}

function dragended(d) {
  // alpha min is 0, head there
  if (!d.active) simulation.alphaTarget(0);
  d.subject.fx = null;
}

function svgX(name, attributes = {}) {
  const el = document.createElementNS(SVG_NS, name);
  for (const attr of Object.keys(attributes)) {
    el.setAttribute(attr, attributes[attr]);
  }
  return el;
}

let css;

const SVG_NS = 'http://www.w3.org/2000/svg';
const el = {};

document.querySelectorAll('[id]').forEach(e => el[e.id] = e);
const a = document.querySelector('#downloadsvg');

a.addEventListener('click', downloadSVG);

function downloadSVG(e) {
  updateDownloadLink(svg.node(), graphData);
  console.log("downloadSVG");
}

async function updateDownloadLink(svgElement, timelineData) {
  try {
    // load CSS if we haven't already
    if (css == null) {
      const response = await fetch('svg.css');
      if (response.ok) css = await response.text();
    }

    // add styling
    const clone = document.importNode(svgElement, true);
    const style = svgX('style');
    style.textContent = css;
    clone.append(style);

    // now update the download URL
    let svgContent = clone.outerHTML;

    svgContent += '<!-- sEpArAtOr' + JSON.stringify(timelineData) + 'sEpArAtOr -->';

    const encodedUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
    el.downloadsvg.href = encodedUri;
  } catch (e) {
    // could not get CSS (or some other problem)
    console.error(e);
    delete el.downloadsvg.href;
    el.downloadsvg.textContent = 'cannot download SVG';
    el.downloadsvg.title = 'cannot download SVG because CSS cannot be fetched';
    css = false;
  }
}


// d3.select("#Downloadsvg").on("click", function() {
//   d3.seslect(this)
//     .attr("href", 'data:application/octet-stream;base64,' + btoa(d3.select("#line").html()))
//     .attr("Downloadsvg", "viz.svg") 
// })

// function downloadSVG() {
//   const svg = document.getElementById('svg').innerHTML;
//   const blob = new Blob([svg.toString()]);
//   const element = document.createElement("a");
//   element.download = "w3c.svg";
//   element.href = window.URL.createObjectURL(blob);
//   element.click();
//   element.remove();
// }


// When 

// The reason i want it to be before the click is that i want this to just be an acnchor that just has a href, so brwoser downloading it automatically. 