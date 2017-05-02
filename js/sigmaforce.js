var extractedNodes = [], extractedLinks = [], goNodes = [];
var nodeLocator = [], linkLocator = [], goTermLocator = [];
var count = 0, linkCount = 0;
var colorPalette = ["#FDD9B5", "#1F75FE", "#FF2B2B", "#76FF7A", "#FB7EFD", "#FFCF48"];
var popUp;
var corumCounter = 0, coexpresCounter = 0, biogridCounter = 0, goCounter = 0, ddCounter = 0;

function initializeCounters() {
	var extractedNodes = [], extractedLinks = [], goNodes = [];
	var nodeLocator = [], linkLocator = [], goTermLocator = [];
	var count = 0, linkCount = 0;
	corumCounter = 0; 
	coexpresCounter = 0;
	biogridCounter = 0; 
	goCounter = 0;
	ddCounter = 0;
}

function getNodeId (uri, type) {
	var nodeIdParts = uri.split(/[:#\/]/);
	if(type == "complex")
		nodeId = "Com" + nodeIdParts[nodeIdParts.length-1];
	else if(type == "go")
		nodeId = "Go" + nodeIdParts[nodeIdParts.length-1];
	else if(type == "domain")
		nodeId = "Dom" + nodeIdParts[nodeIdParts.length-1];
	else
		nodeId = nodeIdParts[nodeIdParts.length-1];
	return nodeId;
}

function createNode(name, uri, type, description, size, cluster) {
	var nodeId = getNodeId(uri, type);
	if(nodeLocator[nodeId] == null) {
		var node = {"id": count, "type": type, "namedId": nodeId, "name" : name, "label": name, "children": [], "description": description, "size": size, "url": uri, "cluster": cluster, "goTerms": []};
		nodeLocator[nodeId] = count++;
		extractedNodes.push(node);
	} else {
		var node = extractedNodes[nodeLocator[nodeId]];
		node.size = node.size+5;
		if(node.name == "" && name != "")
			node.name = name;
	}
	return node;
}

function createMainNode(name, entityUri) {
	return createNode(name, entityUri, "protein", name, 120, 'C2');
}

function createBiogridNodes(data, name, entityUri) {
	var requestedNodeId = getNodeId(entityUri, "protein");
	var requestedNode = extractedNodes[nodeLocator[requestedNodeId]];
	for(i in data){
		var componentNode = createNode(data[i].geneSym.value, data[i].geneTos.value, "protein", ((typeof data[i].pub !== "undefined") ? data[i].pub.value : ''), 20, 'C2');
		var componentNodeId = getNodeId(data[i].geneTos.value, "protein");
		
		if(linkLocator[requestedNodeId +  "-" + componentNodeId + "-biogrid"] == null) {
			var newLink = {"id": linkCount, "source": requestedNode.id, "target": componentNode.id, "value": 1, "color": "#000"};
			extractedLinks.push(newLink);
			requestedNode.children.push(componentNodeId);
			linkLocator[requestedNodeId +  "-" + componentNodeId + "-biogrid"] = linkCount++;
		} else {
			var newLink = extractedLinks[linkLocator[requestedNodeId +  "-" + componentNodeId + "-biogrid"]];
			newLink.value++;
		}
	}
	biogridCounter = 1;
}

function createCorumNodes(data, name, entityUri) {
	var requestedNodeId = getNodeId(entityUri, "protein");
	var requestedNode = extractedNodes[nodeLocator[requestedNodeId]];
	
	for(i in data){
		var corumNode = createNode(data[i].name.value, data[i].corumInt.value, "complex", 
				((typeof data[i].comment !== "undefined") ? data[i].comment.value : ''), 100, 'C1');
		var corumNodeId = getNodeId(data[i].corumInt.value, "complex");
		
		if(linkLocator[corumNodeId + "-" + requestedNodeId] == null) {
			var newLink = {"id": linkCount, "source": requestedNode.id, "target": corumNode.id, 
					"value": 2, "color": "#1F75FE"};
			extractedLinks.push(newLink);
			corumNode.children.push(requestedNodeId);
			linkLocator[corumNodeId + "-" + requestedNodeId] = linkCount++;
		}
		
		var componentNode = createNode(data[i].geneSym.value, data[i].k.value, "protein", data[i].geneSym.value, 20, 'C2');
		var componentNodeId = getNodeId(data[i].k.value, "protein");
		if(linkLocator[corumNodeId + "-" + componentNodeId] == null) {
			var newLink = {"id": linkCount, "source": corumNode.id, "target": componentNode.id, "value": 2, "color": "#1F75FE"};
			extractedLinks.push(newLink);
			corumNode.children.push(componentNodeId);
			linkLocator[corumNodeId + "-" + componentNodeId] = linkCount++;
		}
	}
	
	corumCounter = 1;
}

function createGoNodes(data, name, entityUri) {
	var requestedNodeId = getNodeId(entityUri, "protein");
	var requestedNode = extractedNodes[nodeLocator[requestedNodeId]];
	
	console.log(data.length);
	for(i in data) {
		var goTerm = {"name": data[i].name.value, "entity": data[i].go.value};
		goNodes.push(goTerm);
		
		var cluster = ((data[i].namespace.value == "biological_process") ? 'C3' : 
			((data[i].namespace.value == "cellular_component") ? 'C4' : 'C5'));
		var goNode = createNode(data[i].name.value, data[i].go.value, "go", data[i].description.value, 50, cluster);
		var goNodeId = getNodeId(data[i].go.value, "go");
		if(linkLocator[goNodeId + "-" + requestedNodeId] == null) {
			var newLink = {"id": linkCount, "source": requestedNode.id, "target": goNode.id, "value": 2, "color": "#FFCF48"};
			extractedLinks.push(newLink);
			goNode.children.push(requestedNodeId);
			requestedNode.goTerms.push(goNodeId);
			linkLocator[goNodeId + "-" + requestedNodeId] = linkCount++;
		}
	}
	console.log(goNodes.length);
	//Do not instantiate GoCounter here ;)
}

function createDDNodes(data, name, entityUri) {
	var requestedNodeId = getNodeId(entityUri, "protein");
	var requestedNode = extractedNodes[nodeLocator[requestedNodeId]];
	
	for(i in data){
		var pfamIDParts = data[i].domain.value.split(/[:#\/]/);
		var interPfamIDParts = data[i].interDomain.value.split(/[:#\/]/);
		
		var domainNode = createNode(data[i].name.value, data[i].domain.value, "domain", pfamIDParts[pfamIDParts.length-1], 100, 'C0');
		var domainNodeId = getNodeId(data[i].domain.value, "domain");
		
		if(linkLocator[domainNodeId + "-" + requestedNodeId] == null) {
			var newLink = {"id": linkCount, "source": requestedNode.id, "target": domainNode.id, "value": 2, "color": "#FDD9B5"};
			extractedLinks.push(newLink);
			domainNode.children.push(requestedNodeId);
			linkLocator[domainNodeId + "-" + requestedNodeId] = linkCount++;
		}
		
		if(pfamIDParts[pfamIDParts.length-1] != interPfamIDParts[interPfamIDParts.length-1]) {
			var interDomainNode = createNode(data[i].intername.value, data[i].interDomain.value, "domain", interPfamIDParts[interPfamIDParts.length-1], 100, 'C0');
			var interDomainNodeId = getNodeId(data[i].interDomain.value, "domain");
			if(linkLocator[domainNodeId + "-" + interDomainNodeId] == null) {
				var newLink = {"id": linkCount, "source": domainNode.id, "target": interDomainNode.id, "value": 2, "color": "#FDD9B5"};
				extractedLinks.push(newLink);
				//domainNode.children.push(requestedNodeId);
				linkLocator[domainNodeId + "-" + interDomainNodeId] = linkCount++;
			}
		} else {
			var interDomainNode = domainNode;
			var interDomainNodeId = domainNodeId;
		}
		
		var componentNode = createNode(data[i].geneName.value, data[i].interGene.value, "protein", data[i].geneName.value, 20, 'C2');
		var componentNodeId = getNodeId(data[i].interGene.value, "protein");
		if(linkLocator[interDomainNodeId + "-" + componentNodeId] == null) {
			var newLink = {"id": linkCount, "source": interDomainNode.id, "target": componentNode.id, "value": 2, "color": "#FDD9B5"};
			extractedLinks.push(newLink);
			interDomainNode.children.push(componentNodeId);
			linkLocator[interDomainNodeId + "-" + componentNodeId] = linkCount++;
		}
	}
	
	ddCounter = 1;
}

function createCoexpresNodes(data, name, entityUri) {
	var requestedNodeId = getNodeId(entityUri, "protein");
	var requestedNode = extractedNodes[nodeLocator[requestedNodeId]];
	
	for(i in data){
		var componentNode = createNode(data[i].name.value, data[i].it.value, "protein", ((typeof data[i].pcc !== "undefined") ? data[i].pcc.value : ''), 20, 'C2');
		var componentNodeId = getNodeId(data[i].it.value, "protein");
		
		if(linkLocator[requestedNodeId +  "-" + componentNodeId + "-coexpres"] == null) {
			var newLink = {"id": linkCount, "source": requestedNode.id, "target": componentNode.id, "value": parseFloat(data[i].pcc)*3, "color": "#ff0000"};
			extractedLinks.push(newLink);
			requestedNode.children.push(componentNodeId);
			linkLocator[requestedNodeId +  "-" + componentNodeId + "-coexpres"] = linkCount++;
		}
	}
	coexpresCounter = 1;
}

function linkGeneNodes(data, name, entityUri) {
	var requestedNodeId = getNodeId(entityUri, "go");
	var requestedNode = extractedNodes[nodeLocator[requestedNodeId]];

	for(i in data){
		var assocNodeId = getNodeId(data[i].geneComp.value, "protein");
		var assocNode = extractedNodes[nodeLocator[assocNodeId]];
		if(typeof assocNode === "undefined" )
			continue;
		if(linkLocator[requestedNodeId + "-" + assocNodeId] == null){
			var newLink = {"id": linkCount, "source": requestedNode.id, "target": assocNode.id, "value": 2, "color": "#FFCF48"};
			requestedNode.children.push(assocNodeId);
			assocNode.goTerms.push(requestedNodeId);
			extractedLinks.push(newLink);
			linkLocator[requestedNodeId + "-" + assocNodeId] = linkCount++;
		}
	}
	console.log(goCounter++);
}

function initVisualization(transformedNodes, transformedLinks) {
  // Instanciate sigma.js and customize it :
	var sigInst = sigma.init(document.getElementById('sigmaViz')).drawingProperties({
		"borderSize": 1,//Something other than 0
        "nodeBorderColor": "default",//exactly like this
        "defaultNodeBorderColor": "#000",//Any color of your choice
        "defaultBorderView": "always",//apply the default color to all nodes always (normal+hover)
		"defaultEdgeType": 'curve',
		"labelThreshold": 7,
		"minEdgeSize": 1,
		"maxEdgeSize": 3,
		"defaultLabelColor": '#000'		
	});
 
	var i, N = transformedNodes.length, E = transformedLinks.length, C = 6, d = 0.5, clusters = [];
	for(i = 0; i < 6; i++){
		clusters.push({
			'id': 'C'+i,
			'nodes': [],
			'color': colorPalette[i]
		});
	}
	
	for(i = 0; i < N; i++){
		var size = (Math.sqrt(transformedNodes[i].size))*3/4;
		var cluster = clusters[transformedNodes[i].cluster.substring(1,transformedNodes[i].cluster.length)];
		sigInst.addNode(transformedNodes[i].id,{
			'x': Math.random(),
			'y': Math.random(),
			'size': size,
			'color': cluster['color'],
			'cluster': cluster['id'],
			'label': transformedNodes[i].label,
			'attributes': transformedNodes[i].description
		});
		cluster.nodes.push(transformedNodes[i].id);
	}
 
	for(i = 0; i < E; i++){
		sigInst.addEdge(transformedLinks[i].id, transformedLinks[i].source, transformedLinks[i].target, 
				{'size': transformedLinks[i].value, 'color': transformedLinks[i].color});
	}
 
  // Start the ForceAtlas2 algorithm
  // (requires "sigma.forceatlas2.js" to be included)
	sigInst.startForceAtlas2();
 
	setTimeout(function(){
		sigInst.stopForceAtlas2();
		sigInst
		.bind('overnodes',function(event){
			var nodes = event.content;
		    var neighbors = {};
		    sigInst.iterEdges(function(e){
		    	if(nodes.indexOf(e.source)>=0 || nodes.indexOf(e.target)>=0){
		    		neighbors[e.source] = 1;
		    		neighbors[e.target] = 1;
		    	}
		    }).iterNodes(function(n){
		    	if(!neighbors[n.id]){
		    		n.hidden = 1;
		    	}else{
		    		n.hidden = 0;
		    	}
		    }).draw(2,2,2);
		})
		.bind('outnodes',function(){
			sigInst.iterEdges(function(e){
				e.hidden = 0;
		    }).iterNodes(function(n){
		    	n.hidden = 0;
		    }).draw(2,2,2);
		});
		/*.bind('downnodes',function(event){
			var node;
			sigInst.iterNodes(function(n){
				node = n;
			},[event.content[0]]);
			clearCanvas();
			click(node["label"]);
		});*/
		sigInst.bind('overnodes',showNodeInfo).bind('outnodes',hideNodeInfo).draw();
		
		function hideNodeInfo(event) {
			popUp && popUp.remove();
		      popUp = false;
		}
		
		function showNodeInfo(event) {
		    popUp && popUp.remove();

		    var node;
		    sigInst.iterNodes(function(n){
		      node = n;
		    },[event.content[0]]);
		    
		    console.log( node);
		    var text;
		    switch(node['cluster']) {
		    	case "C0" : text = "<b>Domain PFAM ID</b><br>"; break;
		    	case "C1" : text = "<b>Complex</b><br>"; break;
		    	case "C3" : text = "<b>Biological Process</b><br>"; break;
		    	case "C4" : text = "<b>Cellular Component</b><br>"; break;
		    	case "C5" : text = "<b>Molecular Function</b><br>"; break;
		    	default: text = ""; break;
		    }
		    
		    if(node['cluster'] == "C2") {
		    	if(!isNaN(parseFloat(node['attributes'])))
		    		text += "<b>PCC Expression Score</b><br>" + node['attributes'];
		    	else if (node['attributes'].substring(0,4) == "http") {
		    		var descParts = node['attributes'].split(/[:#\/]/);
		    		text += "<b>Pubmed ID</b><br>" + descParts[descParts.length-1];
		    	}
		    	else
		    		text += node['attributes'];
		    } else 
		    	text += node['attributes'];
		    
		    popUp = $(
		            '<div class="node-info-popup"></div>'
		          ).append(
		            text
		          ).attr(
		            'id',
		            'node-info'+sigInst.getID()
		          ).css({
		            'display': 'inline-block',
					'width' : '300px',
					'overflow' : 'hidden',
		            'border-radius': 3,
		            'padding': 15,
		            'background-color': 'rgba(000,000,000,0.8)',
		            'color': '#fff',
		            'box-shadow': '0 0 4px #666',
		            'position': 'absolute',
		            'left': node.displayX,
		            'top': node.displayY+25
		          });

		          $('ul',popUp).css('margin','0 0 0 20px');
		          $('#sigmaViz').append(popUp);
		}
	},5000);
}

function updateInterface(entityId){
	clearCanvas();
	click(entityId);
}

function allUpdate(){
	clearCanvas();
	initVisualization(extractedNodes, extractedLinks);
}

function clearCanvas(){
	$('#sigmaViz').remove();
	$("#sigmaViz-parent").append('<div id="sigmaViz" class="sigmaViz"></div>');
	$('#sigmaViz').html('');
}
//init();

$('.splashScreenExplorer').hide();