
  var lat = "30.268034";
  var lng = "-97.742777";
  var city = "";
  var trafficLayer ="";
 var map="";
var pos="";
var recenter="";

//button styling for mobile
document.addEventListener("touchstart", function(){}, true);
window.addEventListener("resize", recenterMap);


  $("#submitSearch").on("click", function(event){

    event.preventDefault();

    //remove focus immediately from the search button
    $("#submitSearch").blur();

    //turn off the visual "on" state for traffic button
     $("#trafficButton").removeClass("buttonOn");


    city = $("#searchText").val().trim();
    $(".nocity").css("display", "none");
     $(".nogeo").css("display", "none");
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "&key=AIzaSyC-fJqB4vQYTcq51Xi3xnDEURRVZdsfNKg";

      $.ajax({ url: queryURL, method: "GET" }).done(function(response) {

        if (typeof response.results[0] != 'undefined'){
        lat = response.results[0].geometry.location.lat;
        lng = response.results[0].geometry.location.lng;
        console.log(lat);
        console.log(lng);
        pos = {
              lat: response.results[0].geometry.location.lat,
              lng: response.results[0].geometry.location.lng
            };
         map = new google.maps.Map(document.getElementById('map'), {
          center: {lat, lng},
          zoom: 10
        });
          $('#searchText').val('');
           $('#searchText').attr("placeholder", "City, State");
            trafficMap();
            clearMap();
                      $("#recenterButton").on("click", function(){
              recenterMap();
            });
        } else {
           $(".nocity").css("display", "block");
           return false;
        }
      
      })
 
    //get the news for the city entered in the seach box
    getNews(city);
 
    getWeather(city);

    return false;
   }); // end of submitSearch - for map location




  function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 30.268034, lng: -97.742777},
          zoom: 10
        });


        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
          //set city name
           setCityName();

            var marker = new google.maps.Marker({
              position: pos,
              map: map
            });



           map.setCenter(pos);
            trafficMap();
            clearMap();
          $("#recenterButton").on("click", function(){
              recenterMap();
            });

          }, function() {
              $(".nogeo").css("display", "block");
          });
        } else {
          // Browser doesn't support Geolocation
            $(".nogeo").css("display", "block");
        }
};



      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
         //alert('Geolocation failed: '+error.message);
      $(".nogeo").css("display", "block");
      };



function setCityName(){
       var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + pos.lat + "," + pos.lng+ "&key=AIzaSyC-fJqB4vQYTcq51Xi3xnDEURRVZdsfNKg";
            $.ajax({ url: queryURL, method: "GET" }).done(function(response) {
              city = response.results[0].address_components[3].long_name;
              console.log(city);
                                      //getNews for Geolocated City
              getNews(city);
              //
              //add call to get weather here
              getWeather(city);
              });



};


function trafficMap(){

       
        trafficLayer = new google.maps.TrafficLayer();
         
          $("#trafficButton").on("click", function(){
                  trafficLayer.setMap(map);
                 
                  //add class to show that traffic is "on"
                   $("#trafficButton").addClass("buttonOn");

            });

};


function recenterMap(){

      map.setCenter(pos);


};



function clearMap(){

       
    
         
          $("#normalButton").on("click", function(){
              trafficLayer.setMap(null);

              //turn off the visual "on" for the traffic button
                $("#trafficButton").removeClass("buttonOn");
              //immediately remove the focus state for the normal/reset map button
                $("#normalButton").blur();
            });

};


//}) // end of document ready
//}); // end of document ready

////getNews function

function getNews(city){

  clearNewsVariables();
 
  // return 5 articles
  var numResults  = 5;
  var articleArray = [];
  
  // Array to hold the various article info
  var resultNYT =[]; 
 
  

  var authKey = "b9f91d369ff59547cd47b931d8cbc56b:0:74623931";



  // Based on the city 

  var queryURLBase = "https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=" + authKey + "&sort=newest&q=";

  

 

  //get current date  from moment.js and subtract six months so that oldest article is six months ago 
  var startDate = moment();

  startDate = startDate.subtract(6, "months");
  startDate = startDate.format("YYYYMMDD");

  console.log("From getNews this is the start date for the nyt query = today minus 6 months.  startDate: "+ startDate);

  queryURL = queryURLBase + city;

  queryURL = queryURL + "&begin_date=" + startDate;

  queryURL = queryURL.replace(/\s+/g, '+');

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
  
  // Add City name to the News pannel Title
  $("#news-panel-title").html("Local News for " + city +"  <span class='caret'></span>");


  function displayArticles(){

  var articleGroup="";

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
  
  //create article date in panel
    var articleDateArea = $("<p>");
    articleDateArea.attr("class", "list-group-item-text");

  //create article body in panel
    var articleBody = $("<p><b>");
    articleBody.attr("class", "list-group-item-text");


  //add article heading to link and put it in the panel-header
    // headingLink.html(headline);
     articleHeading.html(headline);

     articleDateArea.append(articleDate+"</b></p>");
  

  //add panel-header to article box
    articleBox.append(articleHeading);

  //add date to article box
    articleBox.append(articleDateArea);

  //add article to articleBody
    articleBody.append(articleAbstract);

  //add panel-body to article box
    articleBox.append(articleBody);
  //write article container to html
    $("#newsContainer").append(articleBox);
 

    }; //for "j" loop end

  }; //end display articles


}; //function getNews

function clearNewsVariables(){
  
  resultNYT ="";
  articleArray ="";
  $("#newsContainer").html("");  //empty() ?
};




//function to get weather

function getWeather(city){

   clearWeatherVariables();
  // Add City name to the News pannel Title
  $("#weather-panel-title").html("Local Weather for " + city+"  <span class='caret'></span>");


 var weatherQuery = "http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lng+"&appid=f84bde1340d8fb2ecf8f1802eedc0991&units=imperial";
  $.ajax({url: weatherQuery, method: "GET"}) 
    .done(function(result) {
      console.log(result);
       var weather=result;

       var temp= "Current Temperature: "+ weather.main.temp+" &#8457;";
       var humidity = "Humidity: "+weather.main.humidity+"%";
       var tempMax = weather.main.temp_max;
       var tempMin = weather.main.temp_min;
       var cloudCover = "Cloud Cover: "+weather.clouds.all+"%";
       var windSpeed = "Wind Speed: "+weather.wind.speed+" mph";
       //var rain3hr = "3 Hour Rainfall"+weather.rain.3h;
       var description = "Current Weather: "+weather.weather[0].description;





        var weatherBox = $("<div>");
        weatherBox.attr("class", "list-group-item");

          //create weather description header in panel-heading
          var currentDesc =$("<h4>");
            currentDesc.attr("class", "panel-heading articleTitle");
            currentDesc.css("font-weight","Bold");
            currentDesc.append(description);

            //create article date in panel
          var currentCond = $("<ul>");
            currentCond.attr("class", "list-group-item-text");

            currentCond.append("<li>"+ temp +"</li>");
            currentCond.append("<li>"+  humidity+"</li>");
            currentCond.append("<li>"+ windSpeed+"</li>");
            currentCond.append("<li>"+  cloudCover+"</li>");
            //currentCond.append("<li>", rain3hr);

            weatherBox.append(currentDesc);
            weatherBox.append(currentCond);

  //write weather to html
    $("#weatherContainer").html(weatherBox);

      }).fail(function(err) {
        throw err;
    });
};//end get weather


  function clearWeatherVariables(){
  
  weather ="";
  weatherBox="";
  $("#weatherContainer").html("");  //empty() ?
  };

$(document).ready(function(){

 initMap();


});