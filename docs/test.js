class GraphVisualization {

    static SVG_NS = 'http://www.w3.org/2000/svg';
  
    constructor() {
        // Initialize properties
        window.addEventListener('load', function () {
        setTimeout(
            function open() { document.querySelector('.popup').style.display = 'block'; },
            1000);
        });

        document.querySelector('#close').addEventListener('click', function () { document.querySelector('.popup').style.display = 'none'; });

        this.svg = d3.select("svg");
        this.width = +this.svg.attr("width");
        this.height = +this.svg.attr("height");
        this.color = d3.scaleOrdinal(d3.schemeCategory10).domain(["core", "optional", "hidden", "level"]);
        this.el = {};

        
        document.querySelectorAll('[id]').forEach(e => this.el[e.id] = e);
  
        // Event listener for SVG download button
        // this.el.downloadsvg.addEventListener('click', () => this.downloadSVG());
  
        // Graph data initialization
        this.graphData = {links: [
            // {source: "Software Engineering", sourceType:"", target: "",targetType: "Course", type: ""},
            
            {source: "Software Engineering", sourceType:"Course", target: "SE L2",targetType: "Learning Outcome", type: "optional"},
            {source: "Software Engineering", sourceType:"Course", target: "SE L3",targetType: "Learning Outcome", type: "level"},
            {source: "Software Engineering", sourceType:"Course", target: "Mark L1",targetType: "Learning Outcome", type: "level"},


            {source: "Mark L1", sourceType:"Learning Outcome", target: "CARMA",targetType: "Module", type: "core"},
            {source: "Mark L1", sourceType:"Learning Outcome", target: "INDAD",targetType: "Module", type: "core"},
            {source: "Mark L1", sourceType:"Learning Outcome", target: "INTPROG",targetType: "Module", type: "core"},
            {source: "Mark L1", sourceType:"Learning Outcome", target: "NETFUN",targetType: "Module", type: "core"},
            
            {source: "Mark L1", sourceType:"Learning Outcome", target: "WEBF1",targetType: "Module", type: "core"},
            // {source: "Mark L1", sourceType:"Learning Outcome", target: "Software Engineering",targetType: "Course", type: "level"},
            
            {source: "WEBF1", sourceType:"Module", target: "Topic-Mark",targetType: "Topic", type: "core"},
            {source: "Topic-Mark", sourceType:"Topic", target: "Assessment-Mark",targetType: "Assessment", type: "level"},
            
            ],
            nodes: [],
        }; 
        // Extract nodes from link data
        this.graphData.nodes = this.extractNodes(this.graphData);
        console.log(this.graphData.nodes)
        // Initialize force simulation
        this.simulation = d3.forceSimulation(this.graphData.nodes)
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collide", d3.forceCollide().radius(30).strength(0.8))
            .force("link", d3.forceLink(this.graphData.links).id(d => d.name))
            .force("x", d3.forceX().strength(0.1).x(this.width / 2))
            .force("y", d3.forceY().strength(0.1).y(this.height / 2))
            .force("chargelink", d3.forceManyBody().strength(-10))
            .on("tick", this.ticked);
  
        // Initialize SVG elements
        this.links = this.svg.append("svg:g")
            .selectAll("line")
            .data(this.graphData.links)
            .enter()
  
            .append("svg:line")
            .attr("name", d => d.name)
            .attr("class", d => "link " + d.type)
            .attr("marker-end", d => "url(#" + d.type + ")");
  
        this.drag = d3.drag()
            .on("start", this.dragstarted)
            .on("drag", this.dragged)
            .on("end", this.dragended);
        
        // console.log('Graph Data: ', this.graphData)
        this.textNode = this.svg
            .append("svg:g")
            .selectAll("g")
            .data(this.graphData.nodes)
            .enter()
            .append("svg:g")
            .attr("Class", d => {
                // console.log('Name:', d.name);
                // console.log('Level:', d.level);
                // console.log('TargetType:', d.targetType);
                // Access level and targetType directly from the node data
                const levelLabel = d.sourceType === "Learning Outcome" ? "Learning Outcome" : (d.sourceType === "Course" ? "Course" : "Module");
                const targetTypeLabel = d.targetType === "Learning Outcome" ? "Learning Outcome" : (d.targetType === "Course" ? "Course" : "Module");
                
                // Construct the class attribute using the level and targetType labels
                return "Level - " + levelLabel + " TargetType - " + targetTypeLabel;
            })
            .attr("marker-end", d => {
                // Use targetType directly to set marker-end attribute
                return "url(#" + d.sourceType + ")";
            })
            
            .call(this.drag);
        
        
        // console.log(this.graphData.nodes)

        this.shapes = this.textNode
            .append('g')
            .attr('class', 'node-shapes')
            .each(function(d) {
                // Calculate the position of the shape relative to the text
            const shapeX = 30; // X position of the text
            const shapeY = 12.5; // Y position of the text

            // Append shapes based on node targetType
            if (d.targetType === 'Module') {
                // For circles, center the shape on the text
                d3.select(this).append('circle')
                    .attr('r', 20)
                    .attr('fill', 'lightgreen')
                    .attr('transform', `translate(${shapeX}, ${shapeY})`);
            } else if (d.targetType === 'Course') {
                // For rectangles, adjust the center position based on text position
                d3.select(this).append('rect')
                    .attr('width', 60)
                    .attr('height', 30)
                    .attr('rx', 10)
                    .attr('ry', 10)
                    .attr('fill', 'lightblue')
                    .attr('transform', `translate(${shapeX -30}, ${shapeY - 15})`);
            } else if (d.targetType === 'Learning Outcome') {
                // For polygons, adjust the starting position based on text position
                d3.select(this).append('polygon')
                    .attr('points', '0,0 40,0 70,30 0,30')
                    .attr('fill', 'orange')
                    .attr('transform', `translate(${shapeX-25}, ${shapeY - 15})`);
            } else if (d.targetType === 'Topic') {
                // For polygons, adjust the starting position based on text position
                d3.select(this).append('polygon')
                    .attr('points', '0,0 40,0 70,40 0,30')
                    .attr('fill', 'pink')
                    .attr('transform', `translate(${shapeX-25}, ${shapeY - 15})`);
            }
            else if (d.targetType === 'Assessment') {
                // For polygons, adjust the starting position based on text position
                d3.select(this).append('polygon')
                    .attr('points', '0,0 40,0 70,30 0,30')
                    .attr('fill', 'yellow')
                    .attr('transform', `translate(${shapeX-25}, ${shapeY - 15})`);
            }
        });


        
        this.texts = this.textNode
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("x", 30)
            .attr("y", 12.5).selectAll("tspan")
            .data(d => d.name.split(' '))
            .enter()
            .append("tspan")
            .text(d => d)
            .attr("x", 30)
            .attr("dy", (d, i) => i * 8);
    }
        // Inside the constructor of GraphVisualization class

    // Append foreignObject elements with input boxes for text editing
    
  
    extractNodes(graphData) {
    let nodeMap = new Map();

    graphData.links.forEach(link => {
        // Add source node
        if (!nodeMap.has(link.source)) {
            nodeMap.set(link.source, {
                name: link.source,
                sourceType: link.sourceType,
                targetType: "", // Initialize targetType
            });
        }
        // Add target node
        if (!nodeMap.has(link.target)) {
            nodeMap.set(link.target, {
                name: link.target,
                sourceType: link.sourceType,
                targetType: link.targetType,
            });
        } else {
            // Update targetType if the node is created from the target
            const node = nodeMap.get(link.target);
            node.targetType = node.targetType || link.targetType; // Update targetType only if it's not defined yet
            nodeMap.set(link.target, node);
        }
    });

    // Convert the map values to an array and map it to include the required properties
    const nodes = Array.from(nodeMap.values()).map((node, index) => {
        return {
            name: node.name,
            level: node.level !== undefined ? node.level : undefined,
            targetType: node.targetType || node.sourceType, // Use targetType if defined, otherwise use sourceType
            index: index,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0
        };
    });
    console.log('Nodes:', nodes);
    return nodes;
}

    
    
    ticked = () => {
        // Clip nodes within the SVG container
        this.textNode.attr("transform", d => `translate(${Math.max(0, Math.min(this.width - 50, d.x))},${Math.max(0, Math.min(this.height - 25, d.y))})`);
        this.links
            .attr("x1", d => Math.max(0, Math.min(this.width, d.source.x)+30))
            .attr("y1", d => Math.max(0, Math.min(this.height, d.source.y)+12.5))
            .attr("x2", d => Math.max(0, Math.min(this.width, d.target.x+30)))
            .attr("y2", d => Math.max(0, Math.min(this.height, d.target.y)+12.5))
  
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
        // window.addEventListener('resize', this.resize);
        window.addEventListener('dragover', e => e.preventDefault());
        window.addEventListener('drop', e => this.acceptDrop(e));

        window.addEventListener('click', (event) => {
            if (event.target.id === 'downloadsvg'){
                this.downloadSVG();
            }
        });
        
        window.addEventListener('click', () => this.downloadJSON());
        document.getElementById('info').value = JSON.stringify(this.graphData.nodes);
        this.el.addnode.addEventListener('click', () => this.addNode())
        this.el.deletenode.addEventListener('click', () => this.delNode())
        this.el.editnode.addEventListener('click', () => this.editNode())
        this.el.addlink.addEventListener('click', () => this.addLink())
        this.el.deletelink.addEventListener('click', () => this.delLink())
        this.svg.on("dblclick", () => this.addNode());
        // this.el.newnode.addEventListener('mousedown', this.handleNewNodeMouseDown);
        document.addEventListener('mousemove', this.handleNewNodeMouseMove);
        document.addEventListener('mouseup', this.handleNewNodeMouseUp);

    }
    

    
    handleNewNodeMouseDown = (event) => {
        // Prevent default behavior to avoid text selection
        event.preventDefault();
        // Set the flag to indicate that dragging has started
        this.isDraggingNewNode = true;
        // Get the initial mouse position
        this.initialMouseX = event.clientX;
        this.initialMouseY = event.clientY;
    }
    
    handleNewNodeMouseMove = (event) => {
        // If dragging has started
        if (this.isDraggingNewNode) {
            // Update the position of the temporary node rectangle
            this.el.newnode.style.left = event.clientX + 'px';
            this.el.newnode.style.top = event.clientY + 'px';
        }
    }
    
    handleNewNodeMouseUp = (event) => {
        // If dragging has started
        if (this.isDraggingNewNode) {
            // Get the position of the mouse relative to the SVG container
            const svgRect = this.svg.node().getBoundingClientRect();
            const mouseX = event.clientX - svgRect.left;
            const mouseY = event.clientY - svgRect.top;
    
            // Create a new node at the final position
            this.createNewNode(mouseX, mouseY);
    
            // Reset dragging flag and remove temporary node rectangle
            this.isDraggingNewNode = false;
            this.el.newnode.style.left = '-9999px';
            this.el.newnode.style.top = '-9999px';
        }
    }
    
    createNewNode(x, y) {
        // Create a new node at the specified position
        const newNode = {
            name: "New Node",
            x: x,
            y: y
        };
    
        // Append the new node to the nodes array
        this.graphData.nodes.push(newNode);
    
        // Update the simulation with the modified graphData
        this.simulation.nodes(this.graphData.nodes);
    
        // Redraw the graph with the modified graphData
        this.redrawGraph(this.graphData);
    
        // Create a group for the new node
        const group = this.svg.append('g')
            .attr('class', 'node')
            .attr('transform', `translate(${x},${y})`)
            .call(this.drag); // Enable dragging for the node
    
        // Create a rectangle for the node
        const rect = group.append('rect')
            .attr('width', 100)
            .attr('height', 50)
            .style('fill', 'lightblue')
            .style('stroke', 'blue')
            .style('stroke-width', 2)
            .on('mousedown', function() {
                d3.event.stopPropagation(); // Prevent dragging when clicking on the rectangle
            });
    
        // Create an editable text box on the node rectangle
        const textBox = group.append('foreignObject')
            .attr('x', 5) // Adjust the position within the rectangle
            .attr('y', 5) // Adjust the position within the rectangle
            .attr('width', 90) // Adjust the size to fit the rectangle
            .attr('height', 40) // Adjust the size to fit the rectangle
            .append('xhtml:div')
            .attr('contenteditable', 'true')
            .style('width', '100%')
            .style('height', '100%')
            .text(newNode.name); // Set initial text content
    
        // Listen for input event to update node name
        textBox.on('input', function() {
            newNode.name = d3.select(this).text().trim(); // Update node name
        });
    
        // Attach the editable text box to the new node
        newNode.textBox = textBox;
    }

    acceptDrop(e) {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f.type === 'application/json') {
            this.readJSONFile(f);
        } else if (f.type === 'image/svg+xml') {
            this.readSVGFile(f);
        }
    }

    gatherInputData(jsonData) {
        const nodes = jsonData.nodes;
        const links = jsonData.links.map(link => {
            return {
                source: link.source.name,
                target: link.target.name,
                type: link.type
            };
        });
    
        return { nodes, links };
    }
    
    readJSONFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const jsonData = JSON.parse(reader.result)
                const graphData = this.gatherInputData(jsonData);
                this.addDataToUI(graphData);
            } catch (error) {
                console.error(error);
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    }
  
    readSVGFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const parts = reader.result.split('sEpArAt0r');
            this.addDataToUI(JSON.parse(parts[1]));
        };
        reader.readAsText(file);
    }
  
    addDataToUI(data) {
        if (data.nodes && data.links) {
            this.graphData.nodes = data.nodes;
            this.graphData.links = data.links;
    
            // Update simulation with new nodes and links
            this.simulation.nodes(this.graphData.nodes);
            this.simulation.force("link").links(this.graphData.links);
            this.simulation.alpha(1).restart();
    
            // Update existing SVG elements without clearing
            this.updateSVGElements();
    
            // Update the positions of existing nodes in the textNode group
            this.textNode.attr("transform", d => `translate(${Math.max(0, Math.min(this.width - 50, d.x))},${Math.max(0, Math.min(this.height - 25, d.y))})`);
        }
    }
    
    updateSVGElements() {
        // Update links and nodes together
        this.links = this.links.data(this.graphData.links, d => `${d.source.name}-${d.target.name}`);
        this.links.exit().remove();
    
        this.textNode = this.textNode.data(this.graphData.nodes, d => d.name);
    
        // Remove elements that are no longer needed
        this.links.exit().remove();
        this.textNode.exit().remove();
    
        // Enter new links
        const newLinks = this.links.enter()
            .append("svg:line")
            .attr("class", d => `link ${d.type}`)
            .attr("marker-end", d => `url(#${d.type})`);
    
        // Enter new nodes
        const newNodeGroups = this.textNode.enter()
            .append("g")
            .call(this.drag);
    
        newNodeGroups.append('rect')
            .attr('width', 60)
            .attr('height', 25)
            .attr("fill", d => this.color(d.group));
    
        newNodeGroups.append("text")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("x", 30)
            .attr("y", 12.5)
            .selectAll("tspan")
            .data(d => Array.isArray(d.name) ? d.name : [d.name])
            .enter()
            .append("tspan")
            .text(d => (typeof d === 'object' && d.name) ? d.name : d);
    
        // Merge links and nodes
        this.links = newLinks.merge(this.links);
        this.textNode = newNodeGroups.merge(this.textNode);
    }
  
    redrawGraph(data) {
        const graphData = data;

        this.graphData.nodes = graphData.nodes;
        this.graphData.links = graphData.links;
    
        // Update simulation with new nodes and links
        this.simulation.nodes(this.graphData.nodes);
        this.simulation.force("link").links(this.graphData.links);
        this.simulation.alpha(1).restart();
    
        // Update existing SVG elements without clearing
        this.updateSVGElements();

        this.textNode.attr("transform", d => `translate(${Math.max(0, Math.min(this.width - 50, d.x))},${Math.max(0, Math.min(this.height - 25, d.y))})`);
    }

    addNode() {
        const nodeName = prompt("Enter Node Name: ");
        const targetNode = prompt("Enter Target Node: ");
        const linkType = prompt("Enter Link Type: ");
    
        if (nodeName) {
            // Check if the node already exists
            const existingNode = this.graphData.nodes.find(node => {
                const nodeNameToCompare = typeof node.name === 'object' ? node.name.name : node.name;
                return nodeNameToCompare === targetNode;
            });
    
            if (existingNode) {
                // Append the new node to the nodes array

                const newNode = { name: nodeName,index: (((this.graphData.nodes).lenghth) + 1) ,x: 400, y: 400 };

                this.graphData.nodes.push(newNode);
  
    
                // Append the new link to the links array, connecting to the existing target node
                this.graphData.links.push({
                    source: existingNode,
                    target: newNode,
                    type: linkType
                });
        
                // Update the simulation with the modified graphData
                // this.updateSimulation(this.graphData);
    
                // Redraw the graph with the modified graphData
                this.redrawGraph(this.graphData);
            } else {
                alert("Target node not found");
            }
        }
        info.value = JSON.stringify(this.graphData.nodes);
    }
    delNode() {
        const nodeName = prompt("Enter Node Name: ");
        if (nodeName) {
            // Find the index of the node to be deleted
            const index = this.graphData.nodes.findIndex(node => node.name === nodeName);
    
            if (index > -1) {
                // Remove the node from the nodes array
                this.graphData.nodes.splice(index, 1);
    
                // Remove any links that reference the deleted node
                this.graphData.links = this.graphData.links.filter(link => link.source.name !== nodeName && link.target.name !== nodeName);
    
                // Update the simulation and redraw the graph
                // this.updateSimulation(this.graphData);
                this.redrawGraph(this.graphData);
            } else {
                alert("Node not found");
            }
        } else {
            alert("Invalid Node Name");
        }
        info.value = JSON.stringify(this.graphData.nodes);
    }

    editNode() {
    const nodeName = prompt("Enter Node Name: ");
    const newNodeName = prompt("Enter New Node Name: ");

    if (nodeName && newNodeName) {
        // Find the node to be edited
        const node = this.graphData.nodes.find(node => node.name === nodeName);
        
        if (node) {
            // Update the node name
            node.name = newNodeName;

            // Select the <text> element corresponding to the edited node
            const textElement = this.textNode.filter(d => d === node).select("text");

            // Update the text content of the <tspan> elements within the selected <text> element
            textElement.selectAll("tspan")
                .text((d, i) => {
                    // Split the new node name by spaces for multiline display
                    const newNameParts = newNodeName.split(' ');
                    // Return the corresponding part of the new name
                    return newNameParts[i] ? newNameParts[i] : '';
                });

            // Update the simulation and redraw the graph
            this.redrawGraph(this.graphData);
        }
    }
    info.value = JSON.stringify(this.graphData.nodes);
}

    editNodeInfo(nodeName, newNodeName) {
        if (nodeName && newNodeName) {
            // Find the node to be edited
            const node = this.graphData.nodes.find(node => node.name === nodeName);
            
            if (node) {
                // Update the node name
                node.name = newNodeName;

                // Select the <text> element corresponding to the edited node
                const textElement = this.textNode.filter(d => d === node).select("text");

                // Update the text content of the <tspan> elements within the selected <text> element
                textElement.selectAll("tspan")
                    .text((d, i) => {
                        // Split the new node name by spaces for multiline display
                        const newNameParts = newNodeName.split(' ');
                        // Return the corresponding part of the new name
                        return newNameParts[i] ? newNameParts[i] : '';
                    });

                // Update the simulation and redraw the graph
                this.redrawGraph(this.graphData);
            }
        }
        info.value = JSON.stringify(this.graphData.nodes);
    }
    

    addLink(){
        const sourceNode = prompt("Enter Source Node: ");
        const targetNode = prompt("Enter Target Node: ");
        const linkType = prompt("Enter Link Type: ");
    
        if (sourceNode && targetNode) {
            // Find the source and target nodes
            const source = this.graphData.nodes.find(node => node.name === sourceNode);
            const target = this.graphData.nodes.find(node => node.name === targetNode);
    
            if (source && target) {
                // Append the new link to the links array
                this.graphData.links.push({
                    source: source,
                    target: target,
                    type: linkType
                });
    
                // Update the simulation with the modified graphData
                // this.updateSimulation(this.graphData);
    
                // Redraw the graph with the modified graphData
                this.redrawGraph(this.graphData);
            } else {
                alert("Source or target node not found");
            }
        } else {
            alert("Invalid source or target node");
        }
        info.value = JSON.stringify(this.graphData.nodes);
    }

    delLink(){
        const sourceNode = prompt("Enter Source Node: ");
        const targetNode = prompt("Enter Target Node: ");

        if (sourceNode && targetNode) {
            // Find the index of the link to be deleted
            const index = this.graphData.links.findIndex(link => link.source.name === sourceNode && link.target.name === targetNode);

            if (index > -1) {
                // Remove the link from the links array
                this.graphData.links.splice(index, 1);

                // Update the simulation and redraw the graph
                // this.updateSimulation(this.graphData);
                this.redrawGraph(this.graphData);
            } else {
                alert("Link not found");
            }
        } else {
            alert("Invalid source or target node");
        }
        info.value = JSON.stringify(this.graphData.nodes);
    }

    downloadSVG = () => {
        try {
            // Clone the SVG element
            const svgClone = this.svg.node().cloneNode(true);
    
            // Append links to the SVG clone
            const group = svgClone.querySelector('g');
            this.graphData.links.forEach(link => {
                const line = document.createElementNS(GraphVisualization.SVG_NS, 'line');
                line.setAttribute('class', `link ${link.type}`);
                line.setAttribute('marker-end', `url(#${link.type})`);
                
                // Set stroke color based on link type using the color scale
                line.setAttribute('stroke', this.color(link.type));

                // Set other attributes as needed, e.g., stroke-dasharray
                if (link.type === 'optional') {
                    line.setAttribute('stroke-dasharray', '5,5');
                }

                // Find source and target nodes
                const sourceNode = this.graphData.nodes.find(node => node.name === link.source.name);
                const targetNode = this.graphData.nodes.find(node => node.name === link.target.name);

                // Calculate link start and end points based on node positions and dimensions
                const x1 = sourceNode.x + 30; // Adjusted for rectangle width
                const y1 = sourceNode.y + 12.5; // Adjusted for half of rectangle height
                const x2 = targetNode.x + 30; // Adjusted for rectangle width
                const y2 = targetNode.y + 12.5; // Adjusted for half of rectangle height

                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);

                group.appendChild(line);
            });
    
            // Serialize the entire clone
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgClone);
    
            // Create a Blob and generate a URL
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
    
            // Update the download link
            const a = document.createElement('a');
            a.href = url;
            a.download = 'graph_with_links.svg';
            a.click();
    
            // Cleanup
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            this.handleDownloadError();
        }
    }
    
    downloadJSON = () => {
        try {
            const jsonData = JSON.stringify(this.graphData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
  
            this.el.downloadjson.href = url;
            this.el.downloadjson.download = 'graphData.json';
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

  const graphViz = new GraphVisualization();
  graphViz.init();