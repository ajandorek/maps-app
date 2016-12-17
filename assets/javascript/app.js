$(document).ready(function(){
// http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID=cd525757f3eeb5be1eefb85a523a2c53
  var lat = "30.268034";
  var lng = "-97.742777";
  var city = "";

  initMap();

  $("#submitSearch").on("click", function(event){

    event.preventDefault();

    city = $("#searchText").val().trim();

    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "&key=AIzaSyCRZI4dIrbRx_-KVnKL_qx-8DKUGDOm0y0";

    $.ajax({ url: queryURL, method: "GET" }).done(function(response) {
      lat = response.results[0].geometry.location.lat;
      lng = response.results[0].geometry.location.lng;
      city = response.results[0].formatted_address;
      console.log(city);
      console.log(lat);
      console.log(lng);

      createMap();
    })

    return false
   });


function createMap(){
 var map = new GMaps({
  div: '#mapContainer',
  lat: lat,
  lng: lng,
  zoom: 10
  });
}

function initMap() {
 var map = new GMaps({
  div: '#mapContainer',
  lat: lat,
  lng: lng,
  zoom: 10
  });

  GMaps.geolocate({
  success: function(position) {
    map.setCenter(position.coords.latitude, position.coords.longitude);
    map.addMarker ({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&key=AIzaSyC-fJqB4vQYTcq51Xi3xnDEURRVZdsfNKg";
    $.ajax({ url: queryURL, method: "GET" }).done(function(response) {
      city = response.results[0].address_components[3].long_name + ", " + response.results[0].address_components[5].short_name;
      console.log(city);
    })
  },
  error: function(error) {
    alert('Geolocation failed: '+error.message);
  }

  });
}


});

