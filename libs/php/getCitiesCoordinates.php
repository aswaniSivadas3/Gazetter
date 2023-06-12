<?php


	$executionStartTime = microtime(true) / 1000;
	
	$result = file_get_contents('../json/citiesCoordinates.json');
    
    
    $citiesAll = json_decode($result,true);
   
	$output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    
    $output['data'] = $citiesAll;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>