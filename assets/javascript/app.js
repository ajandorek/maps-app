$(document).ready(function(){

  var lat = "30.268034";
  var lng = "-97.742777";
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
   });


function createMap() {
  new GMaps({
  div: '#mapContainer',
  lat: lat,
  lng: lng,
  zoom: 10
  });
};

})