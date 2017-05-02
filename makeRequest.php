<?php 

function constructQuery($query, $url)
{
   $format = 'application/sparql-results+json';
 
   $searchUrl = $url . '?'
      .'query='.urlencode($query)
      .'&format='.urlencode($format);
	  
   return $searchUrl;
}
 
 
function request($url)
{
   if (!function_exists('curl_init')){ 
      die('CURL is not installed!');
   }
   $ch= curl_init();
 
   curl_setopt($ch, 
      CURLOPT_URL, 
      $url);
 
   curl_setopt($ch, 
      CURLOPT_RETURNTRANSFER, 
      true);
 
   $response = curl_exec($ch);
 
   curl_close($ch);
 
   return $response;
}

$dataset = $_GET['dataset'];
$entityUri = $_GET['entity'];
$url = "http://vmlifescience01.insight-centre.org:8890/sparql";

switch($dataset) {
	case "corum" : $query = "PREFIX ppi:<http://data.bioinfo.deri.ie/>
							 SELECT * WHERE {
								?corumInt ppi:componentsSynonyms <". $entityUri .">; ppi:componentsSynonyms ?k; ppi:name ?name. 
								?k ppi:officialSymbol ?geneSym .
								OPTIONAL {?corumInt ppi:published_In ?pub}.
								OPTIONAL {?corumInt ppi:functionalComment ?comment} .
								FILTER (?k != <". $entityUri .">)
							}";
					break;
	case "biogrid" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
							   SELECT * WHERE {{
									?biogridInt ppi:left <". $entityUri .">; ppi:right ?geneTos.
								} UNION {
									?biogridInt ppi:right <". $entityUri .">; ppi:left ?geneTos.
								}
								?geneTos ppi:officialSymbol ?geneSym .
								OPTIONAL {?biogridInt ppi:published_in ?pub}.
								OPTIONAL {?biogridInt ppi:qualification ?qual}.
								OPTIONAL {?biogridInt ppi:confidence_score ?score}
							}";
					break;
	case "go" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
						  SELECT * WHERE {							 
								<". $entityUri ."> ppi:GO ?go.							
							    ?go ppi:name ?name; ppi:namespace ?namespace; ppi:description ?description
						}";
					break;
	case "coexpres" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
							    PREFIX ns1: <http://coxpresdb.jp/rdf/def/0.1/>							
							    SELECT DISTINCT ?it ?name ?pcc WHERE {{
									?coexpressInt ns1:gene_id_1 <". $entityUri .">;
									ns1:gene_id_2 ?it; ns1:pcc ?pcc
								} UNION {
									?coexpressInt ns1:gene_id_2 <". $entityUri .">;
									ns1:gene_id_1 ?it; ns1:pcc ?pcc
								}
								?it ppi:officialSymbol ?name
							}   ORDER BY desc(?pcc)";
						break;
	case "goAssoc" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
							   SELECT ?geneComp WHERE {
									<". $entityUri ."> ppi:GO ?go.
									?geneComp ppi:GO ?go.
							}";
						break;
	case "3did" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
						    SELECT DISTINCT ?name ?domain ?interDomain ?intername ?interGene ?geneName WHERE {
						    ?uniprot ppi:entrezGene <". $entityUri .">;  ppi:hasDomain ?domain.
							?domain ppi:officialSymbol ?name .
							{?inter ppi:left ?domain; ppi:right ?interDomain
							} UNION {
 							?inter ppi:right ?domain; ppi:left ?interDomain }
							?interGene ppi:hasDomain ?interDomain .
							?interDomain ppi:officialSymbol ?intername . 
							?interGene ppi:entrezGene ?gene. 
							?gene ppi:officialSymbol ?geneName .
							?inter ppi:score ?score .
						}";
						break;
}
//echo $query;
$requestURL = constructQuery($query, $url);
$responseArray = request($requestURL);
?>
 
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
 
<html xmlns="http://www.w3.org/1999/xhtml">
 
<head>
 
<title>SPARQL Proxy Executor</title>
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
</head>
 
<body><?php echo $responseArray; ?>
</body>
</html>
