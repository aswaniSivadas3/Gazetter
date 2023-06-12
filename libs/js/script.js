var userLat;
var userLng;
var border;
var ctEasyButton;
var userCountry;
var userCountryCode;
var countryLat;
var countryLng;
var countryCurrencyCode;
var countryCurrencySymbol;
var countryCurrencyName;
var wikiUrl;
var map;
var cities;
mapMarker=[];
mapMarkerCluster=[];

var map = L.map('map');

var OSM= L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

OSM.addTo(map);
var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var OPNVKarte = L.tileLayer('https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map <a href="https://memomaps.de/">memomaps.de</a> <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


var baseMaps={
    'Open Street Map': OSM,
    'Open TopoMap':OpenTopoMap,
    'OPNVKarte':OPNVKarte
 }
//L.control.layers(baseMaps).addTo(map);

 
    if(!navigator.geolocation){
    } else{
        navigator.geolocation.getCurrentPosition(getPosition)
    }

    function getPosition(position){
        userLat = position.coords.latitude
        userLng = position.coords.longitude
        //var accuracy = position.coords.accuracy
        $('document').ready(function() {
            cities = L.markerClusterGroup({
                polygonOptions: {
                  fillColor: '#fff',
                  color: '#000',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.5
                }}).addTo(map);
            
            var overlays = {
            "Cities": cities
            };
            
            var layerControl = L.control.layers(baseMaps, overlays).addTo(map);
            countryLat=userLat;
            countryLng=userLng
        
            $.ajax({
                url: "libs/php/getCountryCode.php",
                type: 'GET',
                dataType: 'json',
                data: {
                    lat: String(userLat),
                    lng: String(userLng)
                },
                success: function(result) {
                    if (result.status.name == "ok") {
                        userCountry=result.data.countryName;
                        userCountryCode=result.data.countryCode;
                    }
                
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    
                }
            }); 
        
          
            $.ajax({
                url: "libs/php/countryCord.php",
                type: 'POST',
                dataType: "json",
                
                success: function(result) {
                    if (result.status.name == "ok") {
                        for (var i=0; i<result.data.border.features.length; i++) {
                                    $('#selCountry').append($('<option>', {
                                        value: result.data.border.features[i].properties.iso_a2,
                                        text: result.data.border.features[i].properties.name,
                                        selected:result.data.border.features[i].properties.iso_a2==userCountryCode?true:false
                                    }));
                                }
                            }
                        //sort options alphabetically
                        $("#selCountry").html($("#selCountry option").sort(function (a, b) {
                            return a.text == b.text ? 0 : a.text < b.text ? -1 : 1
                        }))
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                    }
                  });
            
        
            $.ajax({
                url: "libs/php/countryCord.php",
                type: 'POST',
                dataType: 'json',   
                success: function(result) {
            
                    if (border!=undefined) {
                        map.removeLayer(border);
                    }
                      
                    let countryArray = [];
                    let countryOptionTextArray = [];
                
                    for (let i = 0; i < result.data.border.features.length; i++) {
                        if (result.data.border.features[i].properties.iso_a3 === userCountryCode) {
                            countryArray.push(result.data.border.features[i]);
                        }
                    };
                    for (let i = 0; i < result.data.border.features.length; i++) {
                        if (result.data.border.features[i].properties.name === userCountry ) {
                            countryOptionTextArray.push(result.data.border.features[i]);
                        }
                    };
                            
                    border = L.geoJSON(countryOptionTextArray[0], {
                                                                    color: 'rgb(43, 31, 112)',
                                                                    weight: 3,
                                                                    opacity: 0.75,
                                                                    zoom:5,
                                                                    }).addTo(map);
                    
                        
                                                                    let bounds = border.getBounds();
                                                                    map.fitBounds(bounds);
                                                                    map.flyToBounds(bounds, {
                                                                    padding: [35, 35], 
                                                                    duration: 2,
                                                                    });    
                    
                        
                                                
                },
                error: function(jqXHR, textStatus, errorThrown) {
                  // your error code
                }
              }); 

              plotTop10Cities(userCountry);
        
              
        
        });
    //     var latlng = new L.LatLng(userLat, userLng);
    //     map = map.setView(latlng, 8);

    // L.marker(latlng).addTo(map)
    // .bindPopup('you are here')
    // .openPopup();;
    // L.control.layers(baseMaps).addTo(map);
   // location.reload();

    }




$('#selCountry').on('change', function() {
    
   
    for(var i = 0; i < mapMarker.length; i++){
        map.removeLayer(mapMarker[i]);
    }

    for(var i = 0; i < mapMarkerCluster.length; i++){
        map.removeLayer(mapMarkerCluster[i]);
    }

    let selectedCountryCode = $('#selCountry').val();
    let selectedCountryText= $('#selCountry').find('option:selected').text();

    $.ajax({
        url: "libs/php/countryCord.php",
        type: 'POST',
        dataType: 'json',   
        success: function(result) {

            if (border!=undefined) {
                map.removeLayer(border);
            }
              
            let countryArray = [];
            let countryOptionTextArray = [];
        
            for (let i = 0; i < result.data.border.features.length; i++) {
                if (result.data.border.features[i].properties.iso_a3 === selectedCountryCode) {
                    countryArray.push(result.data.border.features[i]);
                }
            };
            for (let i = 0; i < result.data.border.features.length; i++) {
                if (result.data.border.features[i].properties.name === selectedCountryText) {
                    countryOptionTextArray.push(result.data.border.features[i]);
                }
            };
                     
            border = L.geoJSON(countryOptionTextArray[0], {
                                                            color: 'rgb(43, 31, 112)',
                                                            weight: 3,
                                                            opacity: 0.75,
                                                            zoom:5
                                                            }).addTo(map);
                                                            let bounds = border.getBounds();
                                                            map.fitBounds(bounds);

                                                            map.flyToBounds(bounds, {
                                                            padding: [35, 35], 
                                                            duration: 2,
                                                            });    
            
                
                               
                
                
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // your error code
        }
    });

    $.ajax({
        url: "libs/php/getWikiDetails.php",
        type: 'GET',
        dataType: 'json',
        data: {
            countryName:encodeURIComponent($('#selCountry').find('option:selected').text())
        },
        
        success: function(result) {

            if (result.status.name == "ok") {
                countryLat=result.data.lat;
                countryLng=result.data.lng;
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            
        }
    });

    
    plotTop10Cities(selectedCountryText);

});

function easyButton(name, icon) {
    
    L.easyButton({
        states:[
          {
            icon: icon,
            title: name + ' Data',
            onClick: function modal(){
    
                switch(name) {
                    case 'Weather':
                    
                        $.ajax({     
                            url: "libs/php/getCountryWeather.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                lat: countryLat,
                                lon: countryLng
                            },
                            
                            success: function(result) {
                                if (result.status.name == "ok") {
                                    // document.getElementById('id01').style.display='block';
                                    $("#weatherIcon").empty().append("<img src=http://openweathermap.org/img/w/"+result.data.weather[0].icon+".png>")
                                    $("#weatherMain").empty().append("<b>"+result.data.weather[0].main+"</b>");
                                    $("#weatherDescription").empty().append("<b>"+result.data.weather[0].description+"</b>");
                                    $("#weathertemp").empty().append(Math.round(result.data.main.temp)+"℃");
                                    $("#weatherFeels_like").empty().append(Math.round(result.data.main.feels_like)+"℃");
                                    // $("#weatherPressure").empty().append(result.data.main.pressure);
                                    $("#weatherHumidity").empty().append(result.data.main.humidity+"%");
                                    $("#weatherWindSpeed").empty().append(result.data.wind.speed+"mph");
                                    // $("#weatherWindDirection").empty().append(result.data.wind.deg);
                                    // $("#weatherWindGust").empty().append(result.data.wind.gust);
                                    


                                    // $("#localTime").append("Local Time : "+result.data.location.localtime);
                                    // $("#timeZone").append("Time Zone : "+result.data.location.tz_id);
                                    // $("#lastUpdated").append("Details updated on : "+ result.data.current.last_updated)
                                }       
                            },
                    
                            error: function(jqXHR, textStatus, errorThrown) {
                                // your error code
                            }
                        }); 
                        $('#weather-modal').modal('show');
                        break;

                    case 'Forecast':
                        let countryCapital;
                        $.ajax({     
                            url: "libs/php/getCountryFlag.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                               countryCode: $('#selCountry').val()
                            },
                            success: function(result) {
                                if (result.status.name == "ok") {
                                    countryCapital=result.data[0].capital[0];
                                }
                            $.ajax({     
                                url: "libs/php/getCountryWeatherForecast.php",
                                type: 'GET',
                                dataType: 'json',
                                data: {
                                    lat: countryLat,
                                    lon: countryLng
                                },
                                
                                success: function (result) {
                                    
                                    var resultCode = result.status.code
                              
                                    if (result.status.name == "ok") {
                                        $('#weatherModalCapital').empty().append(countryCapital);
                                        // document.getElementById('id01').style.display='block';
                                        // $('#weatherModalLabel').html(result.data.location + ", " + result.data.country);
                                        //var date = new Date(result.data.daily[1].dt * 1000);  
                                        $('#todayConditions').empty().append("<b>"+result.data.daily[0].weather[0].description+"</b>");
                                        $('#todayIcon').empty().append("<img src=http://openweathermap.org/img/w/"+result.data.daily[1].weather[0].icon+".png class=\"img-fluid mt-0\">")
                                        $('#todayMaxTemp').empty().append("<b>"+Math.round(result.data.daily[0].temp.max));
                                        $('#todayMinTemp').empty().append("<b>"+Math.round(result.data.daily[0].temp.min));
                        
                                         var date1 = new Date(result.data.daily[1].dt * 1000); 
                                        $('#day1Date').empty().append("<b>"+date1.toLocaleDateString("en-GB")+"</b>");
                                        $('#day1Icon').empty().append("<img src=http://openweathermap.org/img/w/"+result.data.daily[2].weather[0].icon+".png class=\"img-fluid mt-0\">")
                                        $('#day1MaxTemp').empty().append("<b>"+Math.round(result.data.daily[1].temp.max));
                                        $('#day1MinTemp').empty().append("<b>"+Math.round(result.data.daily[1].temp.min));
                        
                                        var date2 = new Date(result.data.daily[2].dt * 1000); 

                                        $('#day2Date').empty().empty().append("<b>"+date2.toLocaleDateString("en-GB")+"</b>");                
                                        $('#day2Icon').empty().append("<img src=http://openweathermap.org/img/w/"+result.data.daily[2].weather[0].icon+".png class=\"img-fluid mt-0\">")
                                        $('#day2MaxTemp').empty().append("<b>"+Math.round(result.data.daily[2].temp.max));
                                        $('#day2MinTemp').empty().append("<b>"+Math.round(result.data.daily[2].temp.min));
                        
                                        $('#lastUpdated').text(Date(result.data.hourly[0].dt * 1000));
                                        $('.weather-load').addClass("fadeOut");
                                        
                                    }   
                                    
                                    else {
                        
                                        $('#weatherModal .modal-title').replaceWith("Error retrieving data");
                                
                                      } 
                                },
                        
                                error: function (jqXHR, textStatus, errorThrown) {
                                    $('#weatherModal .modal-title').replaceWith("Error retrieving data");
                                  }
                            }); 
                                }
                            });
                          $('#weatherModal').modal('show');
                       
                    break;
                    case 'Currency':
                        $.ajax({     
                            url: "libs/php/getCountryFlag.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                               countryCode: $('#selCountry').val()
                            },
                            success: function(result) {
                                if (result.status.name == "ok") {
                                    countryCurrencyCode=Object.keys(result.data[0].currencies)[0];
                                    countryCurrencyName=result.data[0].currencies[Object.keys(result.data[0].currencies)[0]].name;
                                    countryCurrencySymbol=result.data[0].currencies[Object.keys(result.data[0].currencies)[0]].symbol;                               
                                    
                                    //ajax call to get conversion rate

                                    $.ajax({     
                                        url: "libs/php/getExchangeRate.php",
                                        type: 'GET',
                                        dataType: 'json',
                                        success: function(result) {
                                            if (result.status.name == "ok") {
                                                $("#currency").empty().append(countryCurrencyName);
                                                $("#currencyCode").empty().append(countryCurrencyCode);
                                                $("#currencySymbol").empty().append(countryCurrencySymbol);
                                                $("#exchange").empty().append(result.data.rates[countryCurrencyCode]);
                                                $('.currency-load').addClass("fadeOut");   
                                                                             
                                            }       
                                        },
                            
                                    error: function(jqXHR, textStatus, errorThrown) {
                                        // your error code
                                    }
                                }); 
                                }       
                            },
                
                        error: function(jqXHR, textStatus, errorThrown) {
                            // your error code
                        }
                    }); 
                        $('#exchange-modal').modal('show');
                        break;
                      case 'Wiki':
                       
                        $.ajax({
                            url: "libs/php/getWikiDetails.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                countryName:encodeURIComponent($('#selCountry').find('option:selected').text())
                            },
                            
                            success: function(result) {
                    
                    
                                if (result.status.name == "ok") {
                                    $("#thumbnail").empty().append('<img src='+result.data.thumbnailImg+'>');
                                    $("#summaryRow").empty().append(result.data.summary);                   
                                    $("#linkUrl").empty().append('<a href=https://'+result.data.wikipediaUrl+' target="_blank">Click here for more information...</a>');
                                    $('.wiki-load').addClass("fadeOut");   


                                    // $("#divResultSet").empty();
                                    // $("#divResultSet").append('<br><label> Country Name </label>'+result.data.countryName
                                    // + '<br><label> Country Code </label>'+result.data.countryCode);
                                    
                                }
                            
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                
                            }
                        }); 
                        $('#wiki-modal').modal('show');
                        break;
                      
                      case 'Time':
                        $.ajax({     
                            url: "libs/php/getCountryTimeZone.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                lat: countryLat,
                                lng: countryLng
                            },
                            success: function(result) {
                                if (result.status.name == "ok") {
                                    // document.getElementById('id01').style.display='block';
                                    $("#timeZone").empty().append(result.data.timezoneId);
                                    $("#localTime").empty().append(result.data.time);

                                                              
                                }       
                            },
                    
                            error: function(jqXHR, textStatus, errorThrown) {
                                // your error code
                            }
                        }); 
                        $('#time-modal').modal('show');
                        break;

                      case 'Flag':
                            $.ajax({     
                                url: "libs/php/getCountryFlag.php",
                                type: 'GET',
                                dataType: 'json',
                                data: {
                                   countryCode: $('#selCountry').val()
                                },
                                success: function(result) {
                                    if (result.status.name == "ok") {
                                        $("#flag").empty().append('<img src='+result.data[0].flags.png+'>');
                                        $("#flagDescription").empty().append(result.data[0].flags.alt);
                                        $('.flag-load').addClass("fadeOut");   
                                           
                                                     
                                    }       
                                },
                    
                            error: function(jqXHR, textStatus, errorThrown) {
                                // your error code
                            }
                        }); 
                        $('#flag-modal').modal('show');
                        break;

                        case 'News':
                            $.ajax({     
                                url: "libs/php/getNews.php",
                                type: 'GET',
                                dataType: 'json',
                                data: {
                                    text:encodeURIComponent($('#selCountry').find('option:selected').text())
                                },
                                success: function(result) {
                                    if (result.status.name == "ok") {
                                        $("#news1").empty().append('<b>1. '+result.data.news[0].title+'</b>');
                                        $("#news2").empty().append('<b>2. '+result.data.news[1].title+'</b>');
                                        $("#news3").empty().append('<b>3. '+result.data.news[2].title+'</b>');
                                        $("#news4").empty().append('<b>4. '+result.data.news[3].title+'</b>');
                                        $("#news5").empty().append('<b>5. '+result.data.news[4].title+'</b>');
                                        $('.news-load').addClass("fadeOut");   
                                                     
                                    }       
                                },
                    
                            error: function(jqXHR, textStatus, errorThrown) {
                               
                            }
                        }); 
                        $('#news-modal').modal('show');
                        break;
                    };
            }
          }
        ]
    }).addTo(map);
};

//weatherEasy = new easyButton('Weather', '&#x1F326');
forecastEasy = new easyButton('Forecast', '&#x1F326');
currencyEasy = new easyButton('Currency', '&#x1F4B1');
wikiEasy = new easyButton('Wiki','&#x1F4D6');
timeZone = new easyButton('Time','&#x1F570');
flag = new easyButton('Flag','&#127988');
news = new easyButton('News','&#127760');

function plotTop10Cities(countryName)
{ 
    

   
    var redMarker = L.ExtraMarkers.icon({
        
        shape: 'circle',
        markerColor: 'cyan',
        prefix: 'icon',
        icon: 'libs/css/image/city.png',
        iconColor: '#fff',
        iconRotate: 0,
        extraClasses: '',
        number: '',
        svg: true
      });
      
    $.ajax({
        url: "libs/php/getCitiesCoordinates.php",
        type: 'GET',
        dataType: 'json',   
        success: function(result) {

            if (result.status.name == "ok") {
            let currentCityArray=[{
                cityName:null,
                lat:null,
                lng:null

            }];
            let cityArray=[];
            

            cityArray = result.data;
            if(countryName==undefined)
            {
                countryName=userCountry;
            }

            for (let i = 0; i < cityArray.data.length; i++) {
                if (cityArray.data[i].country === countryName) {
                        
                    currentCityArray.push([cityName=cityArray.data[i].city,
                        lat=cityArray.data[i].lat,
                        lng=cityArray.data[i].lng]);
                }
            };
            //markersCluster=L.markerClusterGroup();
    
            for(let i=1; i<=10; i++){
    
                
                var cityLatlng = new L.LatLng(currentCityArray[i][1], currentCityArray[i][2]);
                map = map.setView(cityLatlng,5);
    
                 L.marker(cityLatlng, {icon:redMarker}).addTo(cities).bindPopup(currentCityArray[i][0]);
                 map.addLayer(cities);
                 mapMarker.push(L.marker);
                 
                 //cities.addLayer(L.marker);
        
            };
            //map.addLayer(cities);
            mapMarkerCluster.push(cities);
                
        }
    },
        error: function(jqXHR, textStatus, errorThrown) {
          
        }
    }); 

}