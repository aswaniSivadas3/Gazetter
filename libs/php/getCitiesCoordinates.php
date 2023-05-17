<?php


	$executionStartTime = microtime(true) / 1000;
	
    //$result = file_get_contents("../json/countries_large.geo.json");
	$result = file_get_contents('../json/citiesCoordinates.json');
	//$result = file_get_contents('../json/countries_large.geo.json');
    
    
    $citiesAll = json_decode($result,true);
    //$countryInfo = json_decode($result,true);
    

    // $country = [];

    // foreach ($countryInfo['features'] as $feature) {
        
    //      $temp = null;
    //      if($feature["properties"]['ISO_A3']=="IND" && $feature["properties"]['ADMIN']=="INDIA")
    //      {
         
    //         $temp['coordinates'] = $feature["geometry"]["coordinates"];
    //         array_push($country,$temp);
            
    //         break;
    //      }

          
    // };


	$output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    //$output['data']['countryInfo'] = $countryInfo;
    
    //$output['data']=$country;
    $output['data'] = $citiesAll;
    // $output['data']['countryInfo'] = $countryInfo;
    
    //repeat above line for each API result

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>