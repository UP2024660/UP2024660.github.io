class GraphVisualization {
    static SVG_NS = 'http://www.w3.org/2000/svg';
    constructor() {
      this.svg = d3.select("svg");
      this.width = this.svg.attr("width");
      this.height = this.svg.attr("height");
      this.color = d3.scaleOrdinal(d3.schemeCategory10).domain(["core", "optional", "hidden", "level"]);
      this.el = {};
      document.querySelectorAll('[id]').forEach(e => this.el[e.id] = e);
      this.el.downloadsvg = document.querySelector('#downloadsvg');
      this.el.downloadsvg.addEventListener('click',this.downloadSVG());
  
      this.graphData = {
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
          ],
          nodes: [],
        };
  
      this.graphData.nodes = this.extractNodes(this.graphData);
  
      this.simulation = d3.forceSimulation(this.graphData.nodes)
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("collide", d3.forceCollide().radius(30).strength(0.8)) // Adjusted strength and radius
      .force("link", d3.forceLink(this.graphData.links).id(d => d.name))
      .force("x", d3.forceX().strength(0.1).x(this.width / 2)) // Added forceX
      .force("y", d3.forceY().strength(0.1).y(this.height / 2)) // Added forceY
      .on("tick", this.ticked);

    
      this.links = this.svg.append("svg:g")
        .selectAll("line")
        .data(this.graphData.links)
        .enter()
        .append("svg:line")
        .attr("class", d => "link " + d.type)
        .attr("marker-end", d => "url(#" + d.type + ")");
  
      this.drag = d3.drag()
        .on("start", this.dragstarted)
        .on("drag", this.dragged)
        .on("end", this.dragended);
  
      this.textNode = this.svg.append("g")
        .selectAll("g")
        .data(this.graphData.nodes)
        .enter()
        .append("g")
        .call(this.drag);
  
      this.rectangles = this.textNode
        .append('rect')
        .attr('width', 50)
        .attr('height', 25)
        .attr("fill", d => this.color(d.group));
  
      this.finalNode = this.textNode
        .append("circle")
        .attr("r", 5)
        .attr("fill", "black");
  
      this.texts = this.textNode
        .append("text")
        .text(d => d.name);
    }
  
    extractNodes(graphData) {
      let nodeSet = new Set();
      graphData.links.forEach(link => {
        nodeSet.add(link.source);
        nodeSet.add(link.target);
      });
      const nodes = Array.from(nodeSet).map(node => {
        return { name: node };
      });
      return nodes;
    }
  
    ticked = () => {
        // Clip nodes within the SVG container
    this.textNode.attr("transform", d => `translate(${Math.max(0, Math.min(this.width -50, d.x))},${Math.max(0, Math.min(this.height - 25, d.y))})`);
    this.links
      .attr("x1", d => Math.max(0, Math.min(this.width, d.source.x)))
      .attr("y1", d => Math.max(0, Math.min(this.height, d.source.y)))
      .attr("x2", d => Math.max(0, Math.min(this.width, d.target.x)))
      .attr("y2", d => Math.max(0, Math.min(this.height, d.target.y)));
  }
    
      dragstarted = (d) => {
        if (!d.active) this.simulation.alphaTarget(0.3).restart();
        d.subject.fx = d.subject.x;
        d.subject.fy = d.subject.y;
      }
    
      dragged = (d) => {
        d.subject.fx = Math.max(0, Math.min(this.width - 50, d.x));
        d.subject.fy = Math.max(0, Math.min(this.height - 50, d.y));
      }
    
      dragended = (d) => {
        if (!d.active) this.simulation.alphaTarget(0);
        d.subject.fx = null;
      }
  
    init() {
      this.ticked(); // Initial tick to set the initial positions
    }

    downloadSVG = () => {
        this.updateDownloadLink(this.svg.node(), this.graphData);
      }

      downloadJSON = () => {
        try {
            const jsonData = JSON.stringify(this.graphData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Update the download link
            this.el.downloadjson.href = url;
            this.el.downloadjson.download = 'graphData.json';
        } catch (e) {
            console.error(e);
            this.handleDownloadError();
        }
    }
    
    updateDownloadLink = (svgElement, timelineData) => {
        try {
          // Load CSS if not loaded yet
          if (this.css == null) {
            fetch('svg.css')
              .then(response => response.text())
              .then(css => {
                this.css = css;
                this.finishUpdateDownloadLink(svgElement, timelineData);
              })
              .catch(error => {
                console.error(error);
                this.handleDownloadError();
              });
          } else {
            this.finishUpdateDownloadLink(svgElement, timelineData);
          }
        } catch (e) {
          console.error(e);
          this.handleDownloadError();
        }
    }

    finishUpdateDownloadLink = (svgElement, timelineData) => {
        try {
          // Add styling
          const clone = document.importNode(svgElement, true);
          const style = this.svgX('style');
          style.textContent = this.css;
          clone.append(style);
      
          // Create a new group for nodes and links
          const group = this.svgX('g');
          
          // Append links to the group
          this.graphData.links.forEach(link => {
            const line = this.svgX('line', {
              x1: link.source.x,
              y1: link.source.y,
              x2: link.target.x,
              y2: link.target.y,
              class: 'link ' + link.type,
              'marker-end': 'url(#' + link.type + ')',
              stroke: this.color(link.type)
            });
            group.appendChild(line);
          });

          // Append nodes to the group
          this.graphData.nodes.forEach(node => {
            const nodeElement = this.svgX('g');
            nodeElement.setAttribute('transform', `translate(${node.x},${node.y})`); // Set the node's position
            const rect = this.svgX('rect', { width: 50, height: 25, fill: this.color(node.group) });
            const circle = this.svgX('circle', { r: 5, fill: 'black' });
            const text = this.svgX('text');
            text.textContent = node.name;
      
            nodeElement.append(rect, circle, text);
            group.appendChild(nodeElement);
          });
      
          // Append the group to the cloned SVG
          clone.querySelector('g').appendChild(group);
      
          // Create a Blob and generate a URL
          const serializer = new XMLSerializer();
          const svgContent = serializer.serializeToString(clone);
          const blob = new Blob([svgContent], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
      
          // Update the download link
          this.el.downloadsvg.href = url;
        } catch (e) {
          console.error(e);
          this.handleDownloadError();
        }
      }
      
    handleDownloadError = () => {
        delete this.el.downloadsvg.href;
        this.el.downloadsvg.textContent = 'Cannot download SVG';
        this.el.downloadsvg.title = 'Error while generating download link';
    }
    
      svgX = (name, attributes = {}) => {
        const el = document.createElementNS(GraphVisualization.SVG_NS, name);
        for (const attr of Object.keys(attributes)) {
          el.setAttribute(attr, attributes[attr]);
        }
        return el;
      }
    }
  
  // Instantiate the class and call the init method
  const graphViz = new GraphVisualization();
  graphViz.init();
  
  // Add event listener to the download button
graphViz.el.downloadsvg.addEventListener('click', () => graphViz.downloadSVG());
graphViz.el.downloadjson.addEventListener('click', () => graphViz.downloadJSON());
