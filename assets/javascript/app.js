
$(document).ready(function(){

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
      console.log(lat);
      console.log(lng);

      createMap();
    })

    //get the news for the city entered in the seach box
    getNews(city);
    

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
    console.log(position.city)
    map.setCenter(position.coords.latitude, position.coords.longitude);
    map.addMarker ({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&key=AIzaSyC-fJqB4vQYTcq51Xi3xnDEURRVZdsfNKg";
    $.ajax({ url: queryURL, method: "GET" }).done(function(response) {
      city = response.results[0].address_components[3].long_name;
      console.log(city);
    })
  },
  error: function(error) {
    alert('Geolocation failed: '+error.message);
  }

  });
}

})

//getNews function

function getNews(city){
  // city is a global variable string for the query
 
  // return 5 articles
  var numResults  = 5;
  var articleArray = [];
  
  // Array to hold the various article info
  var resultNYT =[]; 
 
  

  var authKey = "b9f91d369ff59547cd47b931d8cbc56b:0:74623931";



  // Based on the city 

  var queryURLBase = "https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=" + authKey + "&q=";

  

 

  //get current date  from moment.js and subtract six months so that oldest article is six months ago 
  var startDate = moment();

  startDate = startDate.subtract(6, "months");
  startDate = startDate.format("YYYYMMDD");

  console.log("From getNews this is the start date for the nyt query = today minus 6 months.  startDate: "+ startDate);

  queryURL = queryURLBase + city;

  queryURL = queryURL + "&begin_date=" + startDate;

  // log the url
  console.log("------------------------------------")
  console.log("URL: " + queryURL);
  console.log("------------------------------------")

  // The AJAX function uses the URL and Gets the JSON data associated with it. The data then gets stored in the variable called: "result"
  $.ajax({url: queryURL, method: "GET"}) 
    .done(function(result) {
      console.log(result);
      resultNYT=result; 
      articleArray=resultNYT.response.docs;
      displayArticles();
      }).fail(function(err) {
        throw err;
    });
    
function displayArticles(){

  for (j=0; j < 5; j++) {
  
    var headline = articleArray[j].headline.main;

    if(articleArray[j].byline) {
      var byline = articleArray[j].byline.original;
    } else {
      var byline = "Staff";
    };

    var  articleDate = articleArray[j].pub_date;
    articleDate = articleDate.slice(0,10);


    if (articleArray[j].abstract) {
      var articleAbstract = articleArray[j].abstract;
    } else if (articleArray[j].lead_paragraph) {
      var articleAbstract = articleArray[j].lead_paragraph;
    } else if (articleArray[j].snippet) {
      var articleAbstract = articleArray[j].snippet;
    } else {
      var articleAbstract = "This article does not have a summary."
    };

    if (articleArray[j].web_url){
      var articleLink = articleArray[j].web_url;
    } else {
      var articleLink = "#";
    };

  //make article container that surrounds each article
    var articleBox = $("<a>");
    articleBox.attr("href", articleLink);
    articleBox.attr("class", "list-group-item");
  

  //create article header in panel-heading
    var articleHeading =$("<h4>");
    articleHeading.attr("class", "panel-heading articleTitle");
    articleHeading.css("font-weight","Bold");

  //create article body in panel
    var articleBody = $("<p>");
    articleBody.attr("class", "list-group-item-text");

  //add article heading to link and put it in the panel-header
    // headingLink.html(headline);
     articleHeading.html(headline);

  

  //add panel-header to article box
    articleBox.append(articleHeading);

  //add article to articleBody
    articleBody.append(articleAbstract);

  //add panel-body to article box
    articleBox.append(articleBody);
  //write article container to html
    $("#newsContainer").append(articleBox);
 
    // console.log(headline);
    // console.log(byline);
    // console.log(articleDate);
    // console.log(articleAbstract);
    // console.log(articleLink);

  }; //for "j" loop end

}; //end display articles

//return false;
} //function getNews

function clearNewsVariables(){
  
  resultNYT ="";
  articleArray ="";
  $("#newsContainer").html("");  //empty() ?
};
