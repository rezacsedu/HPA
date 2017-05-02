var repositoryUrl = "http://vmlifescience01.insight-centre.org:8890/sparql?format=text%2Fhtml"
var selectedObject;
var proteins = new Bloodhound({
	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	prefetch: 'data/ppititles.json'
});

proteins.initialize();

$('#autoComDiv .typeahead').typeahead({
		hint: false,
		highlight: true
	},
	{
		name: 'proteins',
		displayKey: 'name',
		source: proteins.ttAdapter(),
		templates: {
			//header: '<h3 class="categoryName"></h3>'
		}
	}
);

function loadGraphData(){
	if (selectedObject != undefined) {
		retrieveGraph(selectedObject);
	}
}

function downloadCanvasGraph(link, canvasId, filename) {
	/*link.href = document.getElementById(canvasId).toDataURL();
	link.download = filename;*/

		var div =  document.getElementById(canvasId);
		html2canvas(div, {
            useCORS: true,
            onrendered: function (canvas) {
            var dataUrl = canvas.toDataURL("image/png");
            link.href = dataUrl;
						link.download = filename;
          }
      });

}

document.getElementById('downloadGraph').addEventListener('click', function() {
    downloadCanvasGraph(this, 'sigmaViz', 'graph.png');
}, false);

$('#autoComDiv').bind('typeahead:selected', function(obj, datum, name) {
	selectedObject = datum;
});

function executeSparql(dataset, entity, name){
	$.ajax({
		url: "makeRequest.php?dataset=" +dataset+ "&entity=" + entity,
	    aync: true,
	    success: function (json) {
	    	var dataParts = json.split('<body>');
	    	var data = JSON.parse(dataParts[dataParts.length-1].split('</body>')[0]);
	    	switch(dataset) {
	    		case "corum" : createCorumNodes(data.results.bindings, name, entity); break;
	    		case "biogrid" : createBiogridNodes(data.results.bindings, name, entity); break;
	    		case "coexpres" : createCoexpresNodes(data.results.bindings, name, entity); break;
	    		case "3did" : createDDNodes(data.results.bindings, name, entity); break;
	    		case "go" : createGoNodes(data.results.bindings, name, entity); break;
	    		case "goAssoc" : linkGeneNodes(data.results.bindings, name, entity); break;
	    	}
	    }
	});
}

function retrieveGraph(datum) {
	initializeCounters();
	clearCanvas();
	$('.splashScreenExplorer').show();
	var mainNode = createMainNode(datum.name, datum.entityURI);
	executeSparql("biogrid", datum.entityURI, datum.name);
	executeSparql("corum", datum.entityURI, datum.name);
	executeSparql("go", datum.entityURI, datum.name);
	executeSparql("3did", datum.entityURI, datum.name);

	var entityParts = datum.entityURI.split('/');
	executeSparql("coexpres", "http://bio2rdf.org/geneid:" + entityParts[entityParts.length-1], datum.name);
	var vizRetriever = setInterval(function(){
		if(biogridCounter && corumCounter && coexpresCounter && ddCounter) {
			clearInterval(vizRetriever);
			if(goNodes.length > 0){
				retrieveAssocGo();
			} else {
				$('.splashScreenExplorer').hide();
				initVisualization(extractedNodes, extractedLinks);
			}
		}
	}, 1000);
}

function retrieveAssocGo() {
	for(i in goNodes){
		executeSparql("goAssoc", goNodes[i].entity, goNodes[i].name); //Get associated Go Genes
	}
	var goAssocRetriever = setInterval(function(){
		if(!(goCounter < goNodes.length-1)) {
			initVisualization(extractedNodes, extractedLinks);
			clearInterval(goAssocRetriever);
			$('.splashScreenExplorer').hide();
		}
	}, 1000);
}
