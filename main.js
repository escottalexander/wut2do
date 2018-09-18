/**
 * This is where all of the variables that need to be globally available are stored.
 */
const STORE = {
    mapId: 0,
    lat: 0,
    lon: 0,
    location: '',
    query: '',
    categoryId: '',
    currentVenueId: '',
    venues: []
};
/**
 * This object is where we have stored all of the settings for the various API calls. It is acknowledged that the API keys are exposed here, but not to worry, as they are solely for this sample project.
 */
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
        success: pushCategories,
        error: errorHandler
    },
    geoLocate: {
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        data: {
            latlng: () => `${STORE.lat},${STORE.lon}`,
            key: 'AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8'
        },
        dataType: 'json',
        type: 'GET',
        success: showGeoLocatedAddress,
        error: errorHandler
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
        success: renderVenueTitles,
        error: errorHandler
    },
    foursquareVenues: {
        url: STORE.currentVenueId,
        data: {
            client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
            client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
            v: '20180823',
        },
        dataType: 'jsonp',
        type: 'GET',
        success: renderVenue,
        error: errorHandler
    }
};
/**
 * Event handling on page load is done here. It watches for clicks, focuses, and keypresses on various elements on the page.
 */
$(event => {
    getCategoriesApiResponse(pushCategories);
    $('#submit').on('click', searchForResults);
    $('#locate').on('click keypress', geoLocateUser);
    $('#results').on('mouseover focus', '.venue', (event) => getVenueApiResponse(event.currentTarget.id));
    $('#results').on('click keypress', '.venue-top', (event) => $(event.currentTarget.parentNode).find('.venueInfo').slideToggle());
});

/**
 * This function is called whenever error handling needs to occur. It sorts the potential errors by the error code and then prints a user sensitive message about the error 
 * @param {number} errorCode 
 * @param {string} errorType 
 * @param {string} errorDetail 
 */
function errorHandler(errorCode) {
    switch (errorCode) {
        case 400:
            $(".msg-handler").html(`
<h2>Please enter a valid address</h2>
`).slideDown(500, () => $(".msg-handler").delay(6000).slideUp(500));
            break;
        case 200:
            $(".msg-handler").html(`
<h2>No results for that search. Try a different search query or location</h2>
`).slideDown(500, () => $(".msg-handler").delay(6000).slideUp(500));
            break;
    }
}
/**
 * A function for geolocating the user utilizing the built in HTML5 geolocator
 */
function geoLocateUser() {
    event.preventDefault();
    navigator.geolocation.getCurrentPosition(reverseGeoLocateApi);
}
/**
 * This function takes the latitude and logitude coordinates and asks a Google reverse geolocation API to return the address
 * @param {requestCallback} position 
 */
function reverseGeoLocateApi(position) {
    STORE.lat = position.coords.latitude;
    STORE.lon = position.coords.longitude;
    $.ajax(settings.geoLocate);
}
/**
 * This function takes the data returned by the Google reverse geolocation API and puts it in the user inputs inside the form element
 * @param {requestCallback} data 
 */
function showGeoLocatedAddress(data) {
    let formattedAddress = data.results[0].formatted_address.split(',');
    let streetAddress = formattedAddress[0];
    let cityName = formattedAddress[1].replace(/ /g, '');
    let stateName = formattedAddress[2].split(' ')[1];
    let zipCode = formattedAddress[2].split(' ')[2];
    $('input[type=address]').val(streetAddress);
    $('input[type=city]').val(cityName);
    $('input[type=state]').val(stateName);
    $('input[type=zip]').val(zipCode);
}
/**
 * this function interfaces with a FourSquare API that return a list of categories that the user can select to narrow their search
 */
function getCategoriesApiResponse() {
    $.ajax(settings.categories);
}
/**
 * This function takes the categories that are returned by FourSquare and appends them to the category selection input
 * @param {requestCallback} data 
 */
function pushCategories(data) {
    for (let i = 0; i < data.response.categories.length; i++) {
        let categoryName = data.response.categories[i].name;
        let categoryId = data.response.categories[i].id;
        $('#categories').append(`<option value=${categoryId}>${categoryName}</option>`);
    }
}
/**
 * On form submit, this function runs, requesting a list of venues defined by the users search queries and location
 */
function searchForResults() {
    event.preventDefault();
    STORE.location = `${$('input[type=address]').val()},${$('input[type=city]').val()},${$('input[type=state]').val()},${$('input[type=zip]').val()}`;
    STORE.query = $('input[type=search]').val();
    STORE.categoryId = $('select[type=dropdown]').val();
    $.ajax(settings.foursquareSearch);
}

/**
 * This function takes the API response and appends the venue titles to the page
 * @param {requestCallback} data 
 */
function renderVenueTitles(data) {
    if (data.meta.code !== 200 || data.response.venues.length === 0) {
        errorHandler(data.meta.code);
    } else {
        let listOfVenues = data.response.venues;
        $('#results').empty();
        for (let i = 0; i < listOfVenues.length; i++) {
            STORE.venues.push(listOfVenues[i]);
            let venueId = listOfVenues[i].id;
            let venueName = listOfVenues[i].name;
            $('#results').append(`<div class="venue"  id=${venueId} accessed="false" aria-live="assertive"><div class="venue-top" tabindex=0><h2 class="title">${venueName}<span class="arrow"></span></h2></div><div class="venueInfo hidden"></div></div>`);
        }
    }
}
/**
 * This function requests the individual venues details
 * @param {string} venueId specific id corresponding to a particular venue
 */
function getVenueApiResponse(venueId) {
    if ($(`#${venueId}`).attr("accessed") === 'false') {
        $(`#${venueId}`).attr('accessed', 'true');
        STORE.currentVenueId = `https://api.foursquare.com/v2/venues/${venueId}`;
        settings.foursquareVenues.url = STORE.currentVenueId;
        $.ajax(settings.foursquareVenues);
    }
}
/**
 * This function renders the specific venues details to the page so the user can view them
 * @param {requestCallback} data 
 */
function renderVenue(data) {
    let id = data.response.venue.id;
    let venueDescription = data.response.venue.description ? data.response.venue.description : '';
    let addressArr = data.response.venue.location.formattedAddress; //array of 3
    let photoUrl = data.response.venue.bestPhoto ? `${data.response.venue.bestPhoto.prefix}500x500${data.response.venue.bestPhoto.suffix}` : '';
    let phoneNumber = data.response.venue.contact.formattedPhone ? data.response.venue.contact.formattedPhone : '';
    let openCurrently = data.response.venue.popular ? data.response.venue.popular.isOpen ? data.response.venue.popular.isOpen : '' : ''; //boolean
    let hoursArr = data.response.venue.popular ? data.response.venue.popular.timeframes ? data.response.venue.popular.timeframes : '' : ''; //Array of 7 starting with today
    let rating = data.response.venue.rating ? data.response.venue.rating : ''; // 7.3
    let url = data.response.venue.url ? data.response.venue.url : '';
    let latlon = `${data.response.venue.location.lat},${data.response.venue.location.lng}`;
    let venueNameForMaps = data.response.venue.name.replace(/ /gi, '+');
    $(`#${id} > .venueInfo`).append(`
    <div class="half-left">
    ${ rating !== '' ? `<h3 class="rating">Rating: <span class="score">${rating}</span></h3>` : ''}
    ${venueDescription !== '' ? `<h4>${venueDescription}</h4>` : ''}
    <div class="address">${renderAddress(addressArr)}</div>
    ${phoneNumber !== '' ? `<div class="contact"><p>${phoneNumber}</p></div>` : ''}
    ${ url !== '' ? `<a href=${url}>Website</a>` : ''}
    ${ openCurrently !== '' ? openCurrently ? `<h4 class="currentStatus">Open Currently</h4>`: `<h4 class="currentStatus">Currently Closed</h4>` : ''}
    ${ hoursArr !== '' ? `<div class="times"><h3>Hours:</h3><ul class="timesList">${renderHours(hoursArr)}</ul></div>`: ''}
    </div>
    <div class="half-right">
    ${renderMap(latlon, venueNameForMaps)}
    ${ photoUrl !== '' ? `<img class="venueImg" src=${photoUrl} alt="Best user submitted image of the venue" />` : ''}
    </div>
    `);
}
/**
 * This helper function recives an array of hour information for a specific venue and returns several <li> element for each day's hours
 * @param {array} arr 
 */
function renderHours(arr) {
    let hours = [];
    for (let i = 0; i < arr.length; i++) {
        hours.push(`<li><p class="day">${arr[i].days}</p>`);
        for (let h = 0; h < arr[i].open.length; h++) {
            hours.push(`<p class="hours">${arr[i].open[h].renderedTime}</p>`);
        }
        hours.push("</li>");
    }
    return hours.join('');
}
/**
 * This helper function takes an array of address components and returns a typically rendered address
 * @param {array} arr 
 */
function renderAddress(arr) {
    let address = [];
    for (let i = 0; i < arr.length; i++) {
        address.push(`<p>${arr[i]}</p>`);
    }
    return address.join('');
}
/**
 * This function takes coordinates and generates an image of a map thanks to the Google static map API
 * @param {string} latlon coordinates seperated by comma
 * @param {string} venueNameForMaps 
 */
function renderMap(latlon, venueNameForMaps) {
    let mapId = STORE.mapId;
    STORE.mapId++;
    return `
    <a href="https://www.google.com/maps/search/?api=1&query=${venueNameForMaps}" target="_blank"><img class="map" id="map_${mapId}" alt="A map of the current venue's location" src='https://maps.googleapis.com/maps/api/staticmap?center=${latlon}&zoom=18&size=500x500&key=AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8'/></a>
    `;
}