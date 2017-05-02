//$.couch.urlPrefix = "https://maulikkamdar.cloudant.com/extractedtitles?callback=";

if(storage.getItem('requestedEntity') != null && storage.getItem('requestedEntity') != '') {
	var entity = storage.getItem('requestedEntity');
	storage.removeItem('requestedEntity');
	popUpInfo(entity);
}

$.widget( "custom.catcomplete", $.ui.autocomplete, {
	_renderMenu: function( ul, items ) {
		var that = this,
        currentCategory = "";
		$.each( items, function( index, item ) {
			if ( item.category != currentCategory ) {
				ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
				currentCategory = item.category;
			}
			that._renderItem( ul, item );
		});
	},
	_renderItem: function( ul, item ) {
		var itemStyle = ((item.category === "") ? ("<b>" + item.label + "</b>") : (item.label));
	    return $( "<li>" )
	      .append( "<a>" + itemStyle + "</a>" )
	      .data("item.autocomplete", item)
	      .appendTo( ul );
	}
});
  
function initSearchMenu(autoCompleteMenu) {
	
	$( "#autoComSearchBox" ).catcomplete({
		source: function( request, response ) {
			$.ajax({
				url: "https://maulikkamdar.cloudant.com/ppientities/_design/alltitles/_view/AllTitles?stale=ok&limit=15&startkey=\"" +request.term + "\"&endkey=\"" +request.term + "\\ufff0\"",
				dataType: "jsonp",
				success: function( data ) {
					data.rows = unique(data.rows);
					data.rows.sort(function(a, b) {
						return a.value.entity.localeCompare(b.value.entity);
					});
				//	console.log(data.rows);
				//	console.log(autoCompleteMenu);
					for(i in autoCompleteMenu) {
						if(autoCompleteMenu[i].toLowerCase().indexOf(request.term.toLowerCase()) > -1) {
							var keyParts = autoCompleteMenu[i].split("-->");
							if(keyParts.length > 1) {
								var linkParts = keyParts[1].split(/[:#\/]/);
								var key = keyParts[0] + " --> " + linkParts[linkParts.length-1] + " --> " + keyParts[2];
							}
							else
								var key = autoCompleteMenu[i];
							var menuItem = {"key" : key, "value" : {"entity" : "", "entityId" : autoCompleteMenu[i]}};
							data.rows.unshift(menuItem);
						}
					}
					
					response( $.map( data.rows, function( item ) {
						var categoryTerms = item.value.entity.split(/[:#\/]/);
						return {
							label: item.key,
							category: categoryTerms[categoryTerms.length-1],
							value: item.key,
							entity: item.value.entityId
						}
					}));
				},
				error: function( error ) {
					var data = {};
					data.rows = [];
				//	console.log(data.rows);
				//	console.log(autoCompleteMenu);
					for(i in autoCompleteMenu) {
						if(autoCompleteMenu[i].toLowerCase().indexOf(request.term.toLowerCase()) > -1) {
							var keyParts = autoCompleteMenu[i].split("-->");
							if(keyParts.length > 1) {
								var linkParts = keyParts[1].split(/[:#\/]/);
								var key = keyParts[0] + " --> " + linkParts[linkParts.length-1] + " --> " + keyParts[2];
							}
							else
								var key = autoCompleteMenu[i];
							var menuItem = {"key" : key, "value" : {"entity" : "", "entityId" : autoCompleteMenu[i]}};
							data.rows.unshift(menuItem);
						}
					}
					
					response( $.map( data.rows, function( item ) {
						var categoryTerms = item.value.entity.split(/[:#\/]/);
						return {
							label: item.key,
							category: categoryTerms[categoryTerms.length-1],
							value: item.key,
							entity: item.value.entityId
						}
					}));
				}
			});
	    },
	    minLength: 2,
	    select: function( event, ui ) {
	    	if(ui.item.category !== "") {
	    	//	popUpInfo(ui.item.entity);
	    	//	updateVisualization (ui.item.category, ui.item.label, ui.item.entity)
			createSparql (ui.item.category, ui.item.label, ui.item.entity, ui.item.property);
	    	} else {
	    		selectConcept(ui.item.entity);
	    	}
	    },
	  	open: function() {
	   		$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
	  	},
	   	close: function() {
	   		$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
	   	}
	 });
}

function createCorumSparql () {
	var sparqlQuery = "PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>" +
			"PREFIX foaf:<http://xmlns.com/foaf/0.1/>" +
			"PREFIX owl:<http://www.w3.org/2002/07/owl#>" +
			"PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>" +
			"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>" +
			"PREFIX ppi:<http://data.bioinfo.deri.ie/>" +
			"CONSTRUCT {" +
			"?corumInt ppi:interactionComp ?k; ppi:published_in ?pub; ppi:qualification ?comment; ppi:officialSymbol ?name" +
			"} WHERE {" +
			"?corumInt ppi:componentsSynonyms <http://linkedlifedata.com/resource/entrez-gene/604>; ppi:componentsSynonyms ?k; ppi:name ?name. " +
			"OPTIONAL {?corumInt ppi:published_In ?pub}." +
			"OPTIONAL {?corumInt ppi:functionalComment ?comment} ." +
			"FILTER (?k != <http://linkedlifedata.com/resource/entrez-gene/604>)" +
			"}"
}
function createSparql(concept, filter, entity, property) {
   	console.log(entity);
    var sparqlQuery = "PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#>" +
				"PREFIX foaf:<http://xmlns.com/foaf/0.1/>" +
				"PREFIX owl:<http://www.w3.org/2002/07/owl#>" +
				"PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>" +
				"PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>" +
				"PREFIX dct:<http://purl.org/dc/terms/>" +
				"PREFIX ppi:<http://data.bioinfo.deri.ie/>" +
				"CONSTRUCT {" +
				"?int ppi:interactionComp ?geneTos; ppi:published_in ?pub; ppi:qualification ?qual; ppi:confidence_score ?score" +
				"} WHERE {{" +
				"?int ppi:left <"+entity+">; ppi:right ?geneTos." +
				"OPTIONAL {?int ppi:published_in ?pub}." +
				"OPTIONAL {?int ppi:qualification ?qual}." +
				"OPTIONAL {?int ppi:confidence_score ?score}" +
				"} UNION {" +
				"?int ppi:right <"+entity+">; ppi:left ?geneTos." +
				"OPTIONAL {?int ppi:published_in ?pub}." +
				"OPTIONAL {?int ppi:qualification ?qual}." +
				"OPTIONAL {?int ppi:confidence_score ?score}" +
				"}} LIMIT 100";
    console.log(sparqlQuery);
    var queryMap = { 'query': sparqlQuery};
    $.ajax({
   	    type : "POST",
   	    url : "http://localhost:7080/openrdf-sesame/repositories/biogrid2",
   	    data : queryMap,
   	    headers: {          
   	    	"Accept": "application/rdf-xml, */*;q=0.5",         
   	    	"Content-Type": "application/x-www-form-urlencoded"   
   	    }
   	    beforeSend : function(data){
   	    	$('.splashScreenExplorer').show();
   	    },
   	    success : function(data){
   	    	$('.splashScreenExplorer').hide();
   	    	console.log(data);
   	    }
   	  });
}

function updateVisualization(concept, filter, entity){
	console.log(concept);
	storage.setItem("requestedEntity", entity);
	
	var targetNode = $.grep(plotJSON.nodes, function(n){
		return (n.name == concept);
	});
	nodes = targetNode[0].mainNumber;
	var propertyNode = $.grep(plotJSON.nodes, function(n){
		return (n.name == "title");
	});
	nodes += "-" + propertyNode[0].mainNumber;
	
	links = targetNode[0].mainNumber+ "." + propertyNode[0].mainNumber;
	filters = links + ".c." + filter;
	reloadQueryParameters = {nodes: nodes, links: links, filters: filters};
	window.location = createURI(reloadQueryParameters);
}

function selectConcept(concept) {
	var queryParameters = parseURI(window.location.search);
	if(queryParameters.nodes != null){
		var input = concept.split("-->");
		var targetLink = $.grep(plotJSON.links, function(n){
			return (n.name == input[1]);
		});
		queryParameters.nodes += "-" + targetLink[0].originalTarget;
		if(queryParameters.links != null)
			queryParameters.links += "-" + targetLink[0].originalSource + "." + targetLink[0].originalTarget;
		else 
			queryParameters.links = targetLink[0].originalSource + "." + targetLink[0].originalTarget;
	} else{
		var input = concept;
		var targetNode = $.grep(plotJSON.nodes, function(n){
			return (n.name == input);
		});
		queryParameters.nodes = targetNode[0].mainNumber;
	}
	
	var flexibleParam = (queryParameters.flexible != null) ? queryParameters.flexible : flexible;
	reloadQueryParameters = {nodes: queryParameters.nodes, links: queryParameters.links, filters: queryParameters.filters, flexible: flexibleParam};
	if(allQueryParams.task != null)
		reloadQueryParameters.task = allQueryParams.task;
	window.location = createURI(reloadQueryParameters);
}
