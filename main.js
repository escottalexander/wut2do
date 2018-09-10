//TODO
// structure the individual venues
// add error handling to venue api response, test by putting in wrong address
// maps of venues locations
// pictures of venue, websites, etc.

const STORE = {
   // mapId: 0,
    lat: 0,
    lon: 0,
    location: '',
    query: '',
    categoryId: '',
    venues: []
};

const settings = {
    categories: {
        url: 'https://api.foursquare.com/v2/venues/categories',
        data: {
            client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
            client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
            v: '20180823'
        },
        dataType: 'jsonp',
        type: 'GET',
        success: pushCategories
    },
    geoLocate: {
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        data: {
            latlng: () => `${STORE.lat},${STORE.lon}`,
            key: 'AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8'
        },
        dataType: 'json',
        type: 'GET',
        success: showGeoLocatedAddress
    },
    foursquareSearch: {
        url: 'https://api.foursquare.com/v2/venues/search',
        data: {
            client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
            client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
            v: '20180823',
            limit: 10,
            radius: 10000,
            intent: 'browse',
            near: () => STORE.location,
            query: () => STORE.query,
            categoryId: () => STORE.categoryId
        },
        dataType: 'jsonp',
        type: 'GET',
        success: renderResponse
    },
    foursquareVenues: {
        url: () => `https://api.foursquare.com/v2/venues/${venueId}`,
        data: {
            client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
            client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
            v: '20180823',
        },
        dataType: 'jsonp',
        type: 'GET',
        success: renderVenue
    }
};

const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/search';
const FOURSQUARE_VENUE_URL = 'https://api.foursquare.com/v2/venues';

// page load events and click events handling
$(event => {
    getCategoriesApiResponse(pushCategories);
    $('#submit').on('click', searchForResults);
    $('#locate').on('click', geoLocateUser);
    $('#results').on('click', '.venue', (event) => getVenueApiResponse(event.target.id));
});

function geoLocateUser() {
    event.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(reverseGeoLocateApi);
    } else {
        //TODO Add UI for this error
        alert("Geolocation is not supported by this browser.");
    }
}

function reverseGeoLocateApi(position) {
    STORE.lat = position.coords.latitude;
    STORE.lon = position.coords.longitude;
    $.ajax(settings.geoLocate);
}

function showGeoLocatedAddress(response) {
    let houseNum = response.results[0].address_components[0].short_name;
    let roadName = response.results[0].address_components[1].short_name;
    let cityName = response.results[0].address_components[2].short_name;
    let stateName = response.results[0].address_components[5].short_name;
    let zipCode = response.results[0].address_components[7].short_name;
    $('input[type=address]').val(`${houseNum} ${roadName}`);
    $('input[type=city]').val(cityName);
    $('input[type=state]').val(stateName);
    $('input[type=zip]').val(zipCode);
}

function getCategoriesApiResponse() {
    $.ajax(settings.categories);
}

function pushCategories(results) {
    for (let i = 0; i < results.response.categories.length; i++) {
        let categoryName = results.response.categories[i].name;
        let categoryId = results.response.categories[i].id;
        $('#categories').append(`<option value=${categoryId}>${categoryName}</option>`);
    }
}

function searchForResults() {
    event.preventDefault();
    STORE.location = `${$('input[type=address]').val()},${$('input[type=city]').val()},${$('input[type=state]').val()},${$('input[type=zip]').val()}`;
    STORE.query = $('input[type=search]').val();
    STORE.categoryId = $('select[type=dropdown]').val();
    $.ajax(settings.foursquareSearch);
}


function renderResponse(results) {
    console.log(results);
    let listOfVenues = results.response.venues;
    $('#results').empty();
    for (let i = 0; i < listOfVenues.length; i++) {
        STORE.venues.push(listOfVenues[i]);
        let venueId = listOfVenues[i].id;
        let venueName = listOfVenues[i].name;
        // let lat = listOfVenues[i].location.lat;
        // let lon = listOfVenues[i].location.lng;
        $('#results').append(`<div class="venue" id=${venueId}>${venueName}</div>`);
    }
}

function getVenueApiResponse(venueId) {
    const settings = {
        url: `${FOURSQUARE_VENUE_URL}/${venueId}`,
        data: {
            client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
            client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
            v: '20180823',
        },
        dataType: 'jsonp',
        type: 'GET',
        success: renderVenue
    };
    $.ajax(settings);
}

function renderVenue(venueInfo) {
    console.log(venueInfo);
    // let name = venueInfo.response.venue.name;
    // let photoUrl = venueInfo.response.photos.url;
    // let distanceAway = venueInfo;
    // return `
    // <h3>${name}- ${distanceAway}</h3>
    // <div class="venue-info hidden"> 
    // <img src=${photoUrl} />
    // <div class="map">
    // </div>
    // </div>
    // `;
}

// function renderMap(lat, lon, venueName) {
//     let mapId = STORE.mapId;
//     STORE.mapId++;
//     return `
//     <div id="map_${mapId}"><img src='https://maps.googleapis.com/maps/api/staticmap?markers=color:blue%7C${lat},${lon}&zoom=18&size=400x400&key=AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8'/></div>
//     `;
// }



//////////////////////////

// const settings = {
// 	"foursquare":{
  
//   },
//   "gmaps": {
  
//   }

// }

// function updateDefaultSettings() {
// 	// update the settings object here
// 	return updatedSettingsObject
// }
// const newSettingsForMyReq = updateDefaultSettings(settings.foursquare);
// $.ajax(newSettingsForMyReq);

// const store = {
//     mapId: 0,
//     lat: 0,
// 		lon: 0,
// };

// /*
//             near: `${$('input[type=address]').val()},${$('input[type=city]').val()},${$('input[type=state]').val()},${$('input[type=zip]').val()}`,
//             query: `${$('input[type=search]').val() === undefined ? '' : $('input[type=search]').val()}`,
// categoryId: `${$('select[type=dropdown]').val() === 'all' ? '' : $('select[type=dropdown]').val()}`

// */
// const newObj = Object.assign(oneObj, secondObj);

// function grabInputValPairs() {
// 	const addressVal = $('input[type=address]').val()
//   const stateVal = $('input[type=state]').val()
//   return { addressVal, stateVal }
//   //makes an object with{ addressVal: "", stateVal: "" }
// }

// const inputObj = grabInputValPairs();
// const completeRequestObj = Object.assign(reqConfigSettings, inputObj)
// $.ajax(completeRequestObj)

// //callback-based API
// $.ajax(initialParams, function callback(data){
// 	//do whatever data manipulation or rendering steps
// });

// const store = {
// 	"venues": []
// }

// $.get(rootURL + "/v3/venues/", function (data){
// 	let filteredDataset = data.venues.filter(venueObj =>
//   	return venueObj.category == "hipster"
//   )
// 	filteredDataset.forEach(venue => {
//   	store.venues.push(venue);
//   });
// 	redrawUI();

// });

// function redrawUI(){
// 	$("some-label").value = store

// }