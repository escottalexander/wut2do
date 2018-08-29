// fetch('https://api.foursquare.com/v2/venues/explore?client_id=KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O&client_secret=MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4&v=20180323&limit=1&ll=40.7243,-74.0018&query=coffee')
//     .then(function() {
//         // Code for handling API response
//     })
//     .catch(function() {
//         // Code for handling errors
//     });
const FOURSQUARE_URL = 'https://api.foursquare.com/v2/venues/explore?client_id=KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O&client_secret=MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4&v=20180323&limit=1&ll=40.7243,-74.0018&query=coffee';

function getApiResponse(location, query, callback) {
const settings = {
    url: FOURSQUARE_URL,
    data: {
        client_id: 'KQZRJLBTVACPKJ2NYBQXS3AZ1ALG0HOWLJVNKI3MKHOPEI3O',
        client_secret: 'MNYP4FZLA33QRUFKTMXCXSYJ00OYBYO2M5IHGL3IUOKD1SW4',
        v:'20180823',
        limit: 1,
        near: location,
        query: `${query === undefined ? '' : query}`
    },
    dataType: 'jsonp',
      type: 'GET',
      success: callback
};
$.ajax(settings);
}
