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

$type = $_GET['type'];
$url = "http://vmlifescience01.insight-centre.org:8890/sparql";

switch($type) {
	case "general1" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                          PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>
                          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                          prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                          prefix owl: <http://www.w3.org/2002/07/owl#>
                          prefix ns: <http://data.bioinfo.deri.ie/gene/>

                          SELECT DISTINCT ?name ?domain ?interDomain ?intername ?interGene ?Protein
                          WHERE {
                          {
                              ?uniprot ppi:entrezGene entrezgene:4772  ; ppi:hasDomain ?domain.
                              ?domain ppi:officialSymbol ?name .
                              {
                                ?inter ppi:left ?domain; ppi:right ?interDomain
                              } UNION {
                                  ?inter ppi:right ?domain; ppi:left ?interDomain
                              }FILTER(?intername=\"Ank_2\")
                              ?interGene ppi:hasDomain ?interDomain .
                              ?interDomain ppi:officialSymbol ?intername .
                              ?interGene ppi:entrezGene ?gene.
                              ?gene ppi:officialSymbol ?Protein.
                              ?inter ppi:score ?score .
                              {SELECT ?Protein WHERE {
                                      ?gene ns:hasTissueExpression ?tissueExpression ;
                                      ns:name ?Protein .
                                      ?tissueExpression ns:hasData ?data .
                                      ?data ns:tissue \"bone marrow\" ;
                                      ns:hasTissueCell ?tissueCell .
                                      ?tissueCell ns:expressionLevel \"high\"  .
                                  }}
                                }
                          }
                          ORDER BY ASC(?Protein)";
					break;
	case "general2" : $query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                            prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                            prefix owl: <http://www.w3.org/2002/07/owl#>
                            prefix ns: <http://data.bioinfo.deri.ie/gene/>
                            SELECT ?gene ?tissueCell ?tissue ?expressionPoint ?cellType ?expressionLevel
                            WHERE {
                               ?gene ns:name \"CD44\";
                                        ns:hasTissueExpression ?tissueExpression.
                              ?tissueExpression ns:hasData ?data.
                              ?data ns:hasTissueCell ?tissueCell;
                            		ns:tissue ?tissue;
                            		ns:expressionLevel ?expressionPoint.
                             ?tissueCell ns:cellType ?cellType;
                            		ns:expressionLevel ?expressionLevel.
                            }";
					break;
	case "general3" : $query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                            prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                            prefix owl: <http://www.w3.org/2002/07/owl#>
                            prefix ns: <http://data.bioinfo.deri.ie/gene/>
                            SELECT ?gene ?cellLine ?level ?tpm ?type
                            WHERE {
                               ?gene ns:name \"CD44\";
                                        ns:hasRnaExpression ?rnaExpression.
                              ?rnaExpression ns:hasData ?data.
                              ?data ns:cellLine ?cellLine;
                            		ns:level ?level;
                            		ns:tpm ?tpm;
                            		ns:type ?type.
                            }";
					break;
	case "general4" : $query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                            prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                            prefix owl: <http://www.w3.org/2002/07/owl#>
                            prefix ns: <http://data.bioinfo.deri.ie/gene/>
                            SELECT ?gene ?cellExpression ?location
                            WHERE {
                               ?gene ns:name \"CD44\";
                                        ns:hasCellExpression ?cellExpression.
                              ?cellExpression  ns:hasData ?data.
                              ?data ns:location ?location.
                            }";
						break;
	case "usercase1" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                              PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>

                              SELECT DISTINCT  ?requestedDomainName ?interactingDomainName ?interactingProteinName
                                 ?validatedProtein ?validatedProteinName ?publication WHERE {

                              	?uniprot ppi:entrezGene entrezgene:3280; ppi:hasDomain ?requestedDomain.
                              	?requestedDomain ppi:officialSymbol ?requestedDomainName .
                              	{
                              		?interaction ppi:left ?requestedDomain; ppi:right ?interactingDomain
                              	} UNION {
                              		?interaction ppi:right ?requestedDomain; ppi:left ?interactingDomain
                              	}
                                      ?interactingProtein ppi:hasDomain ?interactingDomain; ppi:entrezGene ?gene.
                              	?gene ppi:officialSymbol ?interactingProteinName .
                              	?interactingDomain ppi:officialSymbol ?interactingDomainName .
                              	?interaction ppi:score ?score .
                              {
                              		?biogridInteraction ppi:left ?gene; ppi:right ?validatedProtein.
                              	} UNION {
                              		?biogridInteraction ppi:right ?gene; ppi:left ?validatedProtein.
                              	}
                              ?validatedProtein ppi:officialSymbol ?validatedProteinName .
                              OPTIONAL {?biogridInteraction ppi:published_in ?publication}.
                              } LIMIT 100";
						break;
	case "usercase2" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                              PREFIX pfam: <http://linkedlifedata.com/resource/pfam/>

                              SELECT DISTINCT ?desiredDomainName ?interactingDomain ?interactingDomainName
                                 ?validatedScore ?inferredScore WHERE {
                              	pfam:PF00010 ppi:officialSymbol ?desiredDomainName .
                              	{
                              		?interaction ppi:left pfam:PF00010; ppi:right ?interactingDomain
                              	} UNION {
                              		?interaction ppi:right pfam:PF00010; ppi:left ?interactingDomain
                              	}
                              	?interactingDomain ppi:officialSymbol ?interactingDomainName .
                              	OPTIONAL {?interaction ppi:score ?validatedScore} .
                              	OPTIONAL {?interaction ppi:inferredScore ?inferredScore}.
                              }";
						break;
    case "usercase3" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                                PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>

                                SELECT   DISTINCT ?proteinNameA  ?ideogramA ?proteinNameB ?ideogramB  ?inferredScore ?interaction WHERE {
                                entrezgene:3280 ppi:officialSymbol ?proteinNameA .
                                ?uniprotA ppi:entrezGene entrezgene:3280.
                                ?uniprotA ppi:Ensembl ?ensA.
                                ?ideogramA ppi:partOfIdeogram ?ensA.

                                entrezgene:23411 ppi:officialSymbol ?proteinNameB .
                                ?uniprotB ppi:entrezGene entrezgene:23411.
                                ?uniprotB ppi:Ensembl ?ensB.
                                ?ideogramB ppi:partOfIdeogram ?ensB.
                                {
                                	?interaction ppi:left ?ideogramA ; ppi:right ?ideogramB
                                } UNION {
                                	?interaction ppi:left ?ideogramB ; ppi:right ?ideogramA
                                	}
                                ?interaction ppi:inferredScore ?inferredScore.
                                }";
            break;
    case "backend1" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                                PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>

                                SELECT * WHERE {{
                                		?biogridInt ppi:left entrezgene:3280; ppi:right ?geneTos.
                                	} UNION {
                                		?biogridInt ppi:right entrezgene:3280; ppi:left ?geneTos.
                                	}
                                	?geneTos ppi:officialSymbol ?geneSym .
                                	OPTIONAL {?biogridInt ppi:published_in ?pub}.
                                	OPTIONAL {?biogridInt ppi:qualification ?qual}.
                                	OPTIONAL {?biogridInt ppi:confidence_score ?score}
                                }";
            break;
    case "backend2" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                                PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>

                                SELECT * WHERE {
                                	?corumInt ppi:componentsSynonyms entrezgene:3280;
                                	          ppi:componentsSynonyms ?k;
                                			  ppi:name ?name.
                                	?k ppi:officialSymbol ?geneSym .
                                	OPTIONAL {?corumInt ppi:published_In ?pub}.
                                	OPTIONAL {?corumInt ppi:functionalComment ?comment} .
                                	FILTER (?k != entrezgene:3280)
                                }";
            break;
    case "backend3" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                                PREFIX ns1: <http://coxpresdb.jp/rdf/def/0.1/>
                                PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>

                                SELECT DISTINCT ?it ?name ?pcc WHERE {{
                                		?coexpressInt ns1:gene_id_1 entrezgene:3280;
                                		ns1:gene_id_2 ?it; ns1:pcc ?pcc
                                	} UNION {
                                		?coexpressInt ns1:gene_id_2 entrezgene:3280;
                                		ns1:gene_id_1 ?it; ns1:pcc ?pcc
                                	}
                                	?it ppi:officialSymbol ?name
                                } ORDER BY desc(?pcc)";
            break;
    case "backend4" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                                PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>

                                SELECT DISTINCT ?name ?domain ?interDomain ?intername ?interGene  ?geneName WHERE {
                                	?uniprot ppi:entrezGene entrezgene:3280  ; ppi:hasDomain ?domain.
                                	?domain ppi:officialSymbol ?name .
                                	{
                                	  ?inter ppi:left ?domain; ppi:right ?interDomain
                                	} UNION {
                                 		?inter ppi:right ?domain; ppi:left ?interDomain
                                 	}
                                	?interGene ppi:hasDomain ?interDomain .
                                        ?interDomain ppi:officialSymbol ?intername .
                                        ?interGene ppi:entrezGene ?gene.
                                        ?gene ppi:officialSymbol ?geneName.
                                        ?inter ppi:score ?score .
                                }";
            break;
    case "backend5" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                                PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>
                                SELECT * WHERE {
                                	entrezgene:3280 ppi:GO ?go.
                                	?geneComp ppi:GO ?go.
                                	?go ppi:name ?name; ppi:namespace ?namespace; ppi:description ?description .
                                	FILTER (?geneComp != entrezgene:3280)
                                }";
            break;
    case "backend6" : $query = "PREFIX ppi: <http://data.bioinfo.deri.ie/>
                                PREFIX entrezgene: <http://linkedlifedata.com/resource/entrez-gene/>
                                SELECT ?geneComp WHERE {
                                	entrezgene:3280 ppi:GO ?go.
                                	?geneComp ppi:GO ?go.
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
