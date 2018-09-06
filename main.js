//TODO
// structure the individual venues
// add error handling to venue api response, test by putting in wrong address
// maps of venues locations
// pictures of venue, websites, etc.

const STORE = {
    mapId: 0
};
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/search';
const FOURSQUARE_VENUE_URL = 'https://api.foursquare.com/v2/venues'
const FOURSQUARE_CATEGORIES_URL = 'https://api.foursquare.com/v2/venues/categories';
const GOOGLE_REVERSE_GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';


// page load events and click events handling
$(event => {
    getCategoriesApiResponse(pushCategories);
    $('#submit').on('click', searchForResults);
    $('#locate').on('click', geoLocateUser);
});

function geoLocateUser() {
    event.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(reverseGeoLocateApi);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function reverseGeoLocateApi(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    const settings = {
        url: GOOGLE_REVERSE_GEOCODING_URL,
        data: {
            latlng: `${lat},${lon}`,
            key: 'AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8'
        },
        dataType: 'json',
        type: 'GET',
        success: showGeoLocatedAddress
    };
    $.ajax(settings);
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


function getCategoriesApiResponse(callback) {
    const settings = {
        url: FOURSQUARE_CATEGORIES_URL,
        data: {
            client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
            client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
            v: '20180823'
        },
        dataType: 'jsonp',
        type: 'GET',
        success: callback
    };
    $.ajax(settings);
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
    let location = `${$('input[type=address]').val()},${$('input[type=city]').val()},${$('input[type=state]').val()},${$('input[type=zip]').val()}`;
    let query = $('input[type=search]').val();
    let categoryId = $('select[type=dropdown]').val();
    getSearchApiResponse(location, query, categoryId, renderResponse);
}

function getSearchApiResponse(location, query, categoryId, callback) {
    const settings = {
        url: FOURSQUARE_SEARCH_URL,
        data: {
            client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
            client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
            v: '20180823',
            limit: 10,
            radius: 10000,
            intent: 'browse',
            near: location,
            query: `${query === undefined ? '' : query}`,
            categoryId: `${categoryId === 'all' ? '' : categoryId}`
        },
        dataType: 'jsonp',
        type: 'GET',
        success: callback
    };
    $.ajax(settings);
}

function renderResponse(results) {
    //console.log(results);
    let listOfVenues = results.response.venues;
    $('#results').empty();
    for (let i = 0; i < listOfVenues.length; i++) {
        let venueId = listOfVenues[i].id;
        let venueName = listOfVenues[i].name;
        let venueLocation = `${listOfVenues[i].location.formattedAddress[0]} ${listOfVenues[i].location.formattedAddress[1]}`;
        let lat = listOfVenues[i].location.lat;
        let lon = listOfVenues[i].location.lng;
        $('#results').append(`${getVenueApiResponse(venueId, renderVenue)}${renderMap(lat, lon, venueName)}`);
    }
}

function getVenueApiResponse(venueId, renderVenue) {
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
    let name = venueInfo.response.venue.name;
    let photoUrl = venueInfo.response.photos.url;
    let distanceAway = venueInfo;
    return `
    <h3>${name}- ${distanceAway}</h3>
    <div class="venue-info hidden"> 
    <img src=${photoUrl} />
    <div class="map">
    </div>
    </div>
    `;
}

function renderMap(lat, lon, venueName) {
    let mapId = STORE.mapId;
    STORE.mapId++;
    return `
    <div id="map_${mapId}"><img src='https://maps.googleapis.com/maps/api/staticmap?markers=color:blue%7C${lat},${lon}&zoom=18&size=400x400&key=AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8'/></div>
    `;
}
