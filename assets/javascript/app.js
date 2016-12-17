$(document).ready(function(){
// http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID=cd525757f3eeb5be1eefb85a523a2c53
  var lat = "";
  var lng = "";
  var city = "";

  createMap();

  $("#submitSearch").on("click", function(event){

    event.preventDefault();

  if (city === ""){
    city = "Austin, TX";
  } else {
    city = $("#searchText").val().trim();
  }

    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "&key=AIzaSyCRZI4dIrbRx_-KVnKL_qx-8DKUGDOm0y0";

    $.ajax({ url: queryURL, method: "GET" }).done(function(response) {
      lat = response.results[0].geometry.location.lat;
      lng = response.results[0].geometry.location.lng;
      console.log(lat);
      console.log(lng);

      createMap();
    })

    return false
   });// end of submitSearch on click


function createMap() {
 var map = new GMaps({
  div: '#mapContainer',
  lat: lat,
  lng: lng,
  zoom: 10
  });

  GMaps.geolocate({
  success: function(position) {
    map.setCenter(position.coords.latitude, position.coords.longitude);
  },
  error: function(error) {
    alert('Geolocation failed: '+error.message);
  }
  });
};

}) // End of document ready