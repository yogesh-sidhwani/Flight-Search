window.onload = () => {
  init();
}

//This is an Initialization function used to bind click elements to tabs and setting up dummy values in form.
const init = ()  => {
	var flightTabElements = document.querySelectorAll('.flightTripTabs ul li');
	var returnDateFieldElement = document.getElementById('returnDateField');

	returnDateFieldElement.hidden = true;

	flightTabElements.forEach( item => {
		item.onclick = e => {
			item.id === `oneWay` ? returnDateFieldElement.hidden = true : returnDateFieldElement.hidden = false ;
			item.nextElementSibling ? item.nextElementSibling.className = ``: item.previousElementSibling.className = ``;
      item.className = `active`;
		};
	});

  //dummy values used for intialization
  document.getElementById("originCity").value = "pune";
  document.getElementById("destinationCity").value = "delhi";
  document.getElementById("departureDate").value = "2018-09-28";
  document.getElementById("returnDateField").value = "2018-09-29";
}

//This is a handler function for search button click event, it uses some helper 
//functions to load data,filter data based on search and render the list accordingly.
const searchFunction = (...names)  => {
    let originCity =  document.getElementById("originCity").value;
    let destinationCity = document.getElementById("destinationCity").value;
    let departureDate = document.getElementById("departureDate").value;
    let returnDateField = document.getElementById("returnDateField");
    let returnDate = document.getElementById("returnDateField").value;
    let errorDisplay = document.getElementById('error');
    let priceRange = parseInt(names[0]);
    if(originCity && destinationCity && departureDate && (returnDateField.hidden ? true :departureDate) ) {
      errorDisplay.style.display = 'none';
      loadJSON().then((response) => {
        let flightSearchArr = filterFlight(response.data, originCity, destinationCity, departureDate, returnDateField, returnDate, priceRange);
        renderFlightList(flightSearchArr,returnDateField);
      });
    }
    else {
      errorDisplay.style.display = 'block';
    	return;
    }
     
}

//This is a helper function, which is used to load the JSON file. It returns a promise.
const loadJSON = () => {
  return new Promise(function (resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.overrideMimeType("application/json");
      xhr.open('GET', 'data.json', true); 
      xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
             resolve(JSON.parse(xhr.response));
              
          } else {
              reject({
                  status: this.status,
                  statusText: xhr.statusText
              });
          }
      };
      xhr.onerror = function () {
          reject({
              status: this.status,
              statusText: xhr.statusText
          });
      };
      xhr.send();
  });
}

//This is a helper function, which is used to filter the flight list returned from JSON File.
const filterFlight = (flightData, originCity, destinationCity, departureDate, returnDateField, returnDate, priceRange) => {
  return flightData.filter(data => {
    data.price = parseInt(data.price);
    if(!returnDateField.hidden && !priceRange)
      return data.originCity === originCity && data.destinationCity === destinationCity && 
            data.departureDate === departureDate && data.returnDate === returnDate;
    else if(!returnDateField.hidden && priceRange)
      return data.originCity === originCity && data.destinationCity === destinationCity && 
            data.departureDate === departureDate && data.price <= priceRange && data.returnDate === returnDate;
    else if(returnDateField.hidden && priceRange)
      return data.originCity === originCity && data.destinationCity === destinationCity && 
            data.departureDate === departureDate && data.price <= priceRange;
    else
      return data.originCity === originCity && data.destinationCity === destinationCity && 
            data.departureDate === departureDate;
  })
}

//This is a helper function, which renders the filtered list in HTML.
const renderFlightList = (flightSearchArr, returnDateField) => {
    const searchResultsElement = document.getElementById('searchResults');
    const flightList = document.querySelectorAll('.searchResults article');
    flightList.length > 0 ? flightList.forEach( flight => { flight.remove()}) : "";
    const renderFlights = flightSearchArr.map( (flightData) => {
       let flighTemplate = `<div class="flightDetailsContainer">
                <h3> &#8377; ${flightData.price}</h3>
                <div class="flightRoundTripDetails">
                  <div class="oneWayDetailsContainer">
                    <p class="flight-number">${flightData.departureFlight.flightNumber}</p>
                    <p>
                      <span>${flightData.originCityCode}</span>
                      <span> > </span>
                      <span>${flightData.destinationCityCode}</span>
                    </p>
                    <p>
                      <span>Depart: </span>
                      <span>${flightData.departureFlight.departureTime}</span>
                    </p>
                    <p>
                      <span>Arrive: </span>
                      <span>${flightData.departureFlight.arrivalTime}</span>
                    </p>
                  </div>
                  ${!returnDateField.hidden ? `
                  <div class="returnDetailsContainer">
                    <p class="flight-number">${flightData.returnFLight.flightNumber}</p>
                    <p>
                      <span>${flightData.destinationCityCode}</span>
                      <span> > </span>
                      <span>${flightData.originCityCode}</span>
                    </p>
                    <p>
                      <span>Depart: </span>
                      <span>${flightData.returnFLight.departureTime}</span>
                    </p>
                    <p>
                      <span>Arrive: </span>
                      <span>${flightData.returnFLight.arrivalTime}</span>
                    </p>
                  </div>` : `` }
                </div>
              </div>
              <div class="flightLogoContainer">
                <img src="${flightData.flightLogo}"/>
                <button class="bookFlightButton">Book Flight</button>
              </div>`;
            var child = document.createElement('article');  
            child.innerHTML = flighTemplate;
            searchResultsElement.append(child);
    });
 }

//This is a handler function for Price range slider.
 const priceFilterFunction = (value) => {
    debounce(searchFunction(value), 1000);
 }

 // Taken from underscore.js - Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
