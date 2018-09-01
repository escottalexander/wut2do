//TODO
// structure the individual venues
// add HTML5 Geolocation
// maps of venues locations
// pictures of venue, websites, etc.

const STORE = {
    mapId: 0
};
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/search';
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
    // let results = `${GOOGLE_REVERSE_GEOCODING_URL}?latlng=${lat},${lon}&key=AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8`
    // showGeoLocatedAddress(results);
}

function showGeoLocatedAddress(results) {
    console.log(results);
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
            limit: 50,
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
    console.log(results.response.venues);
    let listOfVenues = results.response.venues;
    $('#results').empty();
    for (let i = 0; i < listOfVenues.length; i++) {
        let venueName = listOfVenues[i].name;
        let venueLocation = `${listOfVenues[i].location.formattedAddress[0]} ${listOfVenues[i].location.formattedAddress[1]}`;
        let lat = listOfVenues[i].location.lat;
        let lon = listOfVenues[i].location.lng;
        $('#results').append(`${renderVenue(venueName, venueLocation)}${renderMap(lat, lon, venueName)}`);

    }
}

function renderVenue(venueName, venueLocation) {
    return `<h3>${venueName} - ${venueLocation}</h3>`;
}

function renderMap(lat, lon, venueName) {
    let mapId = STORE.mapId;
    STORE.mapId++;
    return `
    <div id="map_${mapId}"><img src='https://maps.googleapis.com/maps/api/staticmap?markers=color:blue%7C${lat},${lon}&zoom=18&size=400x400&key=AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8'/></div>
    `;
}
