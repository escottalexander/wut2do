// fetch('https://api.foursquare.com/v2/venues/explore?client_id=KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O&client_secret=MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4&v=20180323&limit=1&ll=40.7243,-74.0018&query=coffee')
//     .then(function() {
//         // Code for handling API response
//     })
//     .catch(function() {
//         // Code for handling errors
//     });
const FOURSQUARE_SEARCH_URL = 'https://api.foursquare.com/v2/venues/search';
const FOURSQUARE_CATEGORIES_URL = 'https://api.foursquare.com/v2/venues/categories';



// page load events and click events handling
$(event => {
    getCategoriesApiResponse(pushCategories);
    $('#submit').on('click', searchForResults);
});

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

function pushCategories (results) {
    for (let i = 0; i < results.response.categories.length; i ++) {
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
            categoryId: `${categoryId === 'all' ? '': categoryId}`
        },
        dataType: 'jsonp',
        type: 'GET',
        success: callback
    };
    $.ajax(settings);
}

function renderResponse(results) {
    $('#results').empty();
    for (let i = 0; i < results.response.venues.length; i ++) {
        let venueName = results.response.venues[i].name;
        let venueLocation = `${results.response.venues[i].location.formattedAddress[0]} ${results.response.venues[i].location.formattedAddress[1]}`;
        
        $('#results').append(`<h3>${venueName} - ${venueLocation}</h3>`);
    }
}