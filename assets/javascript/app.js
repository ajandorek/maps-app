//global variables
  var lat = "30.268034";
  var lng = "-97.742777";
  var city = "";
  var trafficLayer ="";
  var map="";
  var pos="";
  var recenter="";
  var weather="";

//button styling for mobile
document.addEventListener("touchstart", function(){}, true);
window.addEventListener("resize", recenterMap);

//assign onclick function to the search button
  $("#submitSearch").on("click", function(event){

    //prevent refresh
    event.preventDefault();

    //remove focus immediately from the search button
    $("#submitSearch").blur();

    //turn off the visual "on" state for traffic button
     $("#trafficButton").removeClass("buttonOn");

     //get the user input from text box
    city = $("#searchText").val().trim();


    //remove any existing warnings 
    $(".nocity").css("display", "none");
    $(".nogeo").css("display", "none");

    //construct the query for getting the geolocation based on ucity input
    var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "&key=AIzaSyC-fJqB4vQYTcq51Xi3xnDEURRVZdsfNKg";

    //remove spaces from query if any
      queryURL = queryURL.replace(/\s+/g, '+');

    //ajax call
      $.ajax({ url: queryURL, method: "GET" }).done(function(response) {

      //check to see if the response is a valid one or not
        if (typeof response.results[0] != 'undefined'){

        //set lat and lng
        lat = response.results[0].geometry.location.lat;
        lng = response.results[0].geometry.location.lng;
        //  console.log(lat);
        // console.log(lng);

       //set position of the middle of the map
        pos = {
              lat: response.results[0].geometry.location.lat,
              lng: response.results[0].geometry.location.lng
            };

        //create map 
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat, lng},
          zoom: 10
        });

        //place marker
        var marker = new google.maps.Marker({
          position: pos,
          map: map
        });
        map.setCenter(pos);
        

        //reset form variables
        $('#searchText').val('');
        $('#searchText').attr("placeholder", "City, State");

        //call traffic api
        trafficMap();
        
        //set City Name calls news and weather
        setCityName();

        //setup basic map and assign it to the clear map button
        clearMap();

        //assign map coordinates to the recenter button
        $("#recenterButton").on("click", function(){
              recenterMap();
            });
        } else {

          //if the response is not valid, display error block
           $(".nocity").css("display", "block");

           //prevent refresh
           return false;
        }
      
      })//end ajax query
 

    //allow "enter" to submit
    return false;
   }); // end of submitSearch - for map location



//setup initial map on load
  function initMap() {

      //set map variable and write to #map
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

          //place marker
            var marker = new google.maps.Marker({
              position: pos,
              map: map
            });

           map.setCenter(pos);

          //traffic api and assign recenter button
            trafficMap();

          //setup basic map and assign it to the clear map button
            clearMap();

          //assign map coordinates to the recenter button  
            $("#recenterButton").on("click", function(){
                recenterMap();
            });

          }, function() {

            //if geolocation is denied or not available, display error box
              $(".nogeo").css("display", "block");
          });
        } else {
          // Browser doesn't support Geolocation, so display error box
            $(".nogeo").css("display", "block");
        }
};//end initMap



function handleLocationError(browserHasGeolocation, infoWindow, pos) {
         //alert('Geolocation failed: '+error.message);
      $(".nogeo").css("display", "block");
      };


//sets the city variable
function setCityName(){
      //construct the the google api query using lats and lngs from ajax responses and geolocation
       var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + pos.lat + "," + pos.lng+ "&key=AIzaSyC-fJqB4vQYTcq51Xi3xnDEURRVZdsfNKg";

          //calls the google map api to get a city name
            $.ajax({ url: queryURL, method: "GET" }).done(function(response) {

            //defines the global var city
              city = response.results[0].address_components[3].long_name;
              //console.log(city);
              
            //getNews for Geolocated City
              getNews(city);
            
            //call the weather api once city has been defined
              getWeather(city);
            });//end ajax call
}; //end function setCityName


//function to retrieve traffic information
function trafficMap(){

      //set traffic layer variable so that traffic can toggle
      trafficLayer = new google.maps.TrafficLayer();
        
      //assign on click functionality to the traffic button
      $("#trafficButton").on("click", function(){
          //add/show traffic layer to map
          trafficLayer.setMap(map);
                 
          //add class to the traffic button to show that traffic is "on"
          $("#trafficButton").addClass("buttonOn");

      }); //end onClick assignment
}; //end trafficMap


//function to recenter the map
function recenterMap(){
    //set map to previously defined map center based on last search or initial geolocation
      map.setCenter(pos);
};


//function to remove traffic from map. **future development needs to update this to clear any other data/map layers**
function clearMap(){

    //assign onClick to the normal/clear button   
      $("#normalButton").on("click", function(){

        //removes data from the traffic layer on the map. does not remove the trafficbutton onclick
          trafficLayer.setMap(null);

        //turn off the visual "on" for the traffic button
          $("#trafficButton").removeClass("buttonOn");
        
        //immediately remove the focus state for the normal/reset map button. especially good for touchscreens
          $("#normalButton").blur();
      }); //end on click
}; //end clearMap


//getNews function
function getNews(city){

  //clear any exsiting global news variables
    clearNewsVariables();
 
  // return 5 articles
    var numResults  = 5;
    var articleArray = [];
  
  // Array to hold the various article info
    var resultNYT =[]; 
    var authKey = "b9f91d369ff59547cd47b931d8cbc56b:0:74623931";

  // construct the query based on the city name
    var queryURLBase = "https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=" + authKey + "&sort=newest&q=";

  //get current date  from moment.js and subtract six months so that oldest article is six months ago 
    var startDate = moment();

      startDate = startDate.subtract(6, "months");
      startDate = startDate.format("YYYYMMDD");

    //console.log("From getNews this is the start date for the nyt query = today minus 6 months.  startDate: "+ startDate);

    //add city to the query
      queryURL = queryURLBase + city;

    //add begin date to query
      queryURL = queryURL + "&begin_date=" + startDate;

    //remove any spaces from the city name in the query and replace with a "+"
      queryURL = queryURL.replace(/\s+/g, '+');

  // // log the url
  // console.log("------------------------------------")
  // console.log("URL: " + queryURL);
  // console.log("------------------------------------")

  // The AJAX function uses the URL and Gets the JSON data associated with it. The data then gets stored in the variable called: "result"
    $.ajax({url: queryURL, method: "GET"}) 
      .done(function(result) {
        //console.log(result);
          resultNYT=result; 
          articleArray=resultNYT.response.docs;

          //take results and run function to display articles
            displayArticles();

        }).fail(function(err) {
          throw err;
      }); //end ajax call
  
    // Add City name to the News pannel Title
      $("#news-panel-title").html("Local News for " + city +"  <span class='caret'></span>");

  //write articles to the DOM
    function displayArticles(){

      var articleGroup="";

      for (j=0; j < 5; j++) {
      
        var headline = articleArray[j].headline.main;

        //check if article has a byline
          if(articleArray[j].byline) {
            var byline = articleArray[j].byline.original;
          } else {
            var byline = "Staff";
          };

        //set article date
          var  articleDate = articleArray[j].pub_date;
          articleDate = articleDate.slice(0,10);

        //check if article has an abstract, lead paragraph, snippet
          if (articleArray[j].abstract) {
            var articleAbstract = articleArray[j].abstract;
          } else if (articleArray[j].lead_paragraph) {
            var articleAbstract = articleArray[j].lead_paragraph;
          } else if (articleArray[j].snippet) {
            var articleAbstract = articleArray[j].snippet;
          } else {
            var articleAbstract = "This article does not have a summary."
          };

        //check if article has a link  
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


//fucntion to clear newsvariables
function clearNewsVariables(){
  resultNYT ="";
  articleArray ="";
  //clear existing articles
  $("#newsContainer").html("");  //empty() ?
};




//function to get weather
function getWeather(city){

  //clear any existing weather variables
    clearWeatherVariables();
  // Add City name to the News pannel Title
    $("#weather-panel-title").html("Local Weather for " + city+"  <span class='caret'></span>");

  //construct weather underground query. make sure it starts with https
    var weatherQuery = "https://api.wunderground.com/api/61929af079ddbd78/geolookup/conditions/q/"+lat+","+lng+".json";

  //weatherQuery = weatherQuery.replace(/\s+/g, '+');
  //console.log(weatherQuery);

  //ajax query for weather underground
  $.ajax({url: weatherQuery, method: "GET"}) 
    .done(function(result) {
      
      //assign results to weather variable to make the object more readable
       weather=result;
        //    console.log(weather);

        //set weather variables from the object
        var temp = "Current Temperature: "+ weather.current_observation.temp_f+" &#8457;";
        var feelsLike = "Feels Like: "+ weather.current_observation.feelslike_f+" &#8457;";
        var humidity = "Humidity: "+ weather.current_observation.relative_humidity;
       
        var rainToday = "Rain Today: "+ weather.current_observation.precip_today_in+" in.";
        var windSpeed = "Wind Speed: "+ weather.current_observation.wind_string;
        var windChill = "Wind Chill: "+ weather.current_observation.windchill_f+" &#8457;";
        
        var weatherIcon =  weather.current_observation.icon_url;
        //geolocation requires https, so replace http with https in the resulting icon url
          weatherIcon = weatherIcon.replace("http", "https");

        //construct the weather status description with the html for the weather icon
        var description = "Current Weather: "+ weather.current_observation.weather+"<img src='"+weatherIcon+"' />";

              // console.log(temp);
              // console.log(feelsLike);
              // console.log(humidity);
              // console.log(rainToday);
              // console.log(windSpeed);
              // console.log(windChill);
              // console.log(weatherIcon);
              // console.log(description);

        //create a weatherbox to hold a list group of weather data      
          var weatherBox = $("<div>");
            weatherBox.attr("class", "list-group-item");

        //create weather description header in panel-heading
          var currentDesc =$("<h4>");
            currentDesc.attr("class", "panel-heading articleTitle");
            currentDesc.css("font-weight","Bold");
            currentDesc.append(description);

        //create article date in panel
          var currentCond = $("<ul>");
            currentCond.attr("class", "list-group");

          //add weather info list items to the unordered list  
            currentCond.append("<li class='list-group-item'>"+ temp +"</li>");
            currentCond.append("<li class='list-group-item'>"+ feelsLike +"</li>");
            currentCond.append("<li class='list-group-item'>"+ humidity +"</li>");
            currentCond.append("<li class='list-group-item'>"+ windSpeed +"</li>");
            currentCond.append("<li class='list-group-item'>"+ windChill +"</li>");
            currentCond.append("<li class='list-group-item'>"+ rainToday +"</li>");

          //weather underground requires the logo display as a TOS for using the API
            currentCond.append("<li class='list-group-item'><img id='wglogo'class='img img-responsive' src='assets/img/wundergroundLogo_4c_horz.png' /></li>");
            
          //add description heading and current condition ul to weatherbox
            weatherBox.append(currentDesc);
            weatherBox.append(currentCond);

          //write weather to html
            $("#weatherContainer").html(weatherBox);

      }).fail(function(err) {
        throw err;
    });
};//end get weather


//function to clear any existing weather variables
function clearWeatherVariables(){
  weather ="";
  weatherBox="";
  
  //remove any existing weather info in the html
    $("#weatherContainer").html("");  //empty() ?
}; //end clearweathervariables


//run initMap on document ready
$(document).ready(function(){
  initMap();
});