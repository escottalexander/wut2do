//TODO
// add error handling to venue api response, test by putting in wrong address
// investigate zip code issues with geolocation
// up/down arrow on .title element
// GeoLocation button position and style

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
        success: renderVenueTitles
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
        success: renderVenue
    }
};

$(event => {
    getCategoriesApiResponse(pushCategories);
    $('#submit').on('click', searchForResults);
    $('#locate').on('click', geoLocateUser);
    $('#results').on('click', '.venue', (event) => getVenueApiResponse(event.currentTarget.id));
    $('#results').on('click', '.venue-top', (event) => $(event.currentTarget.parentNode).find('.venueInfo').toggleClass('hidden'));
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
    let formattedAddress = response.results[0].formatted_address.split(',');
    let streetAddress = formattedAddress[0];
    let cityName = formattedAddress[1].replace(/ /g, '');
    let stateName = formattedAddress[2].split(' ')[1];
    let zipCode = formattedAddress[2].split(' ')[2];
    $('input[type=address]').val(streetAddress);
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


function renderVenueTitles(results) {
    let listOfVenues = results.response.venues;
    $('#results').empty();
    for (let i = 0; i < listOfVenues.length; i++) {
        STORE.venues.push(listOfVenues[i]);
        let venueId = listOfVenues[i].id;
        let venueName = listOfVenues[i].name;
        $('#results').append(`<div class="venue" id=${venueId} accessed="false"><div class="venue-top"><h3 class="title">${venueName}</h3></div><div class="venueInfo hidden"></div></div>`);
    }
}

function getVenueApiResponse(venueId) {
    if ($(`#${venueId}`).attr("accessed") === 'false') {
        $(`#${venueId}`).attr('accessed', 'true');
        STORE.currentVenueId = `https://api.foursquare.com/v2/venues/${venueId}`;
        settings.foursquareVenues.url = STORE.currentVenueId;
        $.ajax(settings.foursquareVenues);
    }
}

function renderVenue(venueInfo) {
    console.log(venueInfo);
    let id = venueInfo.response.venue.id;
    let venueDescription = venueInfo.response.venue.description ? venueInfo.response.venue.description : '';
    let addressArr = venueInfo.response.venue.location.formattedAddress; //array of 3
    let photoUrl = venueInfo.response.venue.bestPhoto ? `${venueInfo.response.venue.bestPhoto.prefix}300x300${venueInfo.response.venue.bestPhoto.suffix}` : '';
    let phoneNumber = venueInfo.response.venue.contact.formattedPhone ? venueInfo.response.venue.contact.formattedPhone : '';
    let openCurrently = venueInfo.response.venue.popular ? venueInfo.response.venue.popular.isOpen ? venueInfo.response.venue.popular.isOpen : '' : ''; //boolean
    let hoursArr = venueInfo.response.venue.popular ? venueInfo.response.venue.popular.timeframes ? venueInfo.response.venue.popular.timeframes : '' : ''; //Array of 7 starting with today
    let rating = venueInfo.response.venue.rating ? venueInfo.response.venue.rating : ''; // 7.3
    let url = venueInfo.response.venue.url ? venueInfo.response.venue.url : '';
    let latlon = `${venueInfo.response.venue.location.lat},${venueInfo.response.venue.location.lng}`;
    let venueNameForMaps = venueInfo.response.venue.name.replace(/ /gi, '+');
    console.log(venueNameForMaps);
    $(`#${id} > .venueInfo`).append(`
    <div class="half-left">
    ${venueDescription !== '' ? `<h4>${venueDescription}</h4>` : ''}
    ${ rating !== '' ? `<h3 class="rating">Rating: <span class="score">${rating}</span></h3>` : ''}
    <div class="address">${renderAddress(addressArr)}</div>
    ${phoneNumber !== '' ? `<div class="contact">${phoneNumber}</div>` : ''}
    ${ url !== '' ? `<a href=${url}>Website</a>` : ''}
    ${ openCurrently !== '' ? openCurrently ? `<h4>Open Currently</h4>`: `<h4>Currently Closed</h4>` : ''}
    ${ hoursArr !== '' ? `<div class="times"><h3>Hours:</h3><ul class="timesList">${renderHours(hoursArr)}</ul></div>`: ''}
    </div>
    <div class="half-right">
    ${renderMap(latlon, venueNameForMaps)}
    ${ photoUrl !== '' ? `<img class="venueImg" src=${photoUrl} />` : ''}
    </div>
    `);
}

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

function renderAddress(arr) {
    let address = [];
    for (let i = 0; i < arr.length; i++) {
        address.push(`<p>${arr[i]}</p>`);
    }
    return address.join('');
}

function renderMap(latlon, venueNameForMaps) {
    let mapId = STORE.mapId;
    STORE.mapId++;
    return `
    <a href="https://www.google.com/maps/search/?api=1&query=${venueNameForMaps}" target="_blank"><img class="map" id="map_${mapId}" src='https://maps.googleapis.com/maps/api/staticmap?center=${latlon}&zoom=18&size=350x350&key=AIzaSyDiXUZ7Xr5xmORnIYMRrFh5-Y3HnnMzBc8'/></a>
    `;
}