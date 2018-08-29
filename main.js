// fetch('https://api.foursquare.com/v2/venues/explore?client_id=KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O&client_secret=MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4&v=20180323&limit=1&ll=40.7243,-74.0018&query=coffee')
//     .then(function() {
//         // Code for handling API response
//     })
//     .catch(function() {
//         // Code for handling errors
//     });
const FOURSQUARE_URL = 'https://api.foursquare.com/v2/venues/search';

// handle clicks
$(event => {
    $('#submit').on('click', searchForResults);
});

function searchForResults() {
    event.preventDefault();
    let location = `${$('input[type=address]').val()},${$('input[type=city]').val()},${$('input[type=state]').val()},${$('input[type=zip]').val()}`;
    let query;
    getApiResponse(location, query, renderResponse);
}

function getApiResponse(location, query, callback) {
    const settings = {
        url: FOURSQUARE_URL,
        data: {
            client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
            client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
            v: '20180823',
            limit: 50,
            radius: 10000,
            intent: 'browse',
            near: location,
            query: `${query === undefined ? '' : query}`
        },
        dataType: 'jsonp',
        type: 'GET',
        success: callback
    };
    $.ajax(settings);
}

function renderResponse(results) {
    for (let i = 0; i < results.response.venues.length; i ++) {
        let venueName = results.response.venues[i].name;
        let venueLocation = `${results.response.venues[i].location.formattedAddress[0]} ${results.response.venues[i].location.formattedAddress[1]}`;
    $('#results').append(`<h3>${venueName} - ${venueLocation}</h3>`);
    }
    console.log(results);
}