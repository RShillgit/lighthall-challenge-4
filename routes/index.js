var express = require('express');
var router = express.Router();
const async = require('async');

// Client/App ID: 7GX4j2Oh3hQL61YdWbQvQw
// API Key: fSxcLW2UZE5mCMllnwKp3ScxTtNq0WZtk97g8EC7JYigyFyqqox6gE2KWjYpdzkhag3UgEpcrbVOFlPa38o9_siMkhXqGYtS3sXjk0eWlMOuIB43J0pCgSa5S0ZRZHYx

// Yelp SDK
const sdk = require('api')('@yelp-developers/v1.0#deudoolf6o9f51');

// *IMPORTANT* The API MUST INCLUDE a location, either a string or longitude/latitude
// *IMPORTANT* Calls to this api must have an Authorization HTTP header with a value of "Bearer <API Key>""
sdk.auth('Bearer fSxcLW2UZE5mCMllnwKp3ScxTtNq0WZtk97g8EC7JYigyFyqqox6gE2KWjYpdzkhag3UgEpcrbVOFlPa38o9_siMkhXqGYtS3sXjk0eWlMOuIB43J0pCgSa5S0ZRZHYx');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* API INFORMATION ON BUSINESS SEARCHES
https://docs.developer.yelp.com/reference/v3_business_search
*/

router.post('/api', (req, res) => {

  let cuisine1 = req.body.formattedData.formattedCuisines.user1;
  let cuisine2 = req.body.formattedData.formattedCuisines.user2;
  if(cuisine1 === null) cuisine1 = [];
  else cuisine1 = [cuisine1.toLowerCase()];
  if (cuisine2 === null) cuisine2 = [];
  else cuisine2 = [cuisine2.toLowerCase()];

  const location1 = req.body.formattedData.formattedLocations.user1;
  const location2 = req.body.formattedData.formattedLocations.user2;
  const radius = req.body.formattedData.formattedRadius;
  const price = req.body.formattedData.formattedPrice;

  async.parallel(
    {
      location1Search(callback) {
        // Latitude/Longitude location
        if (typeof(location1) === 'object') {
          sdk.v3_business_search({
            latitude: location1.latitude,
            longitude: location1.longitude,
            term: 'restaurants',
            categories: cuisine1,
            radius: radius,
            price: price,
            open_now: true, // CAN ALSO USE open_at with unix time 
            sort_by: 'best_match',
            limit: '5' // Max 50
          })
          .then(data => {
            callback(null, data)
          })
        } 
        // String location
        else {
          sdk.v3_business_search({
            location: location1, 
            term: 'restaurants',
            categories: cuisine1,
            radius: radius,
            price: price,
            open_now: true, // CAN ALSO USE open_at with unix time 
            sort_by: 'best_match', 
            limit: '5' // Max 50
          })
          .then(data => {
            callback(null, data)
          })
        }
      },
      location2Search(callback) {

        // Latitude/Longitude location
        if (typeof(location2) === 'object') {
          sdk.v3_business_search({
            latitude: location2.latitude,
            longitude: location2.longitude, 
            term: 'restaurants',
            categories: cuisine2,
            radius: radius, 
            price: price,
            open_now: true, // CAN ALSO USE open_at with unix time 
            sort_by: 'best_match',
            limit: '5' // Max 50
          })
          .then(data => {
            callback(null, data)
          })
        } 
        // String location
        else {
          sdk.v3_business_search({
            location: location2, 
            term: 'restaurants',
            categories: cuisine2,
            radius: radius, 
            price: price,
            open_now: true, // CAN ALSO USE open_at with unix time 
            sort_by: 'best_match', 
            limit: '5' // Max 50
          })
          .then(data => {
            callback(null, data)
          })
        }
      },
    }, (err, results) => {
      if(err) {
        return res.status(500).json({success: false, err: err});
      }

      // Remove duplicates
      const restaurants = [... results.location1Search.data.businesses];

      results.location2Search.data.businesses.forEach(business => {
        if (!restaurants.some(restaurant => restaurant.id === business.id)) {
          restaurants.push(business);
        }
      })

      if (restaurants.length === 0) {
        return res.status(200).json({success: false, error: "There are no restaurants with the given criteria"})
      }

      return res.status(200).json({success: true, restaurants: restaurants})
    }
  )
})

router.get('/api/:id', (req, res) => {

  sdk.v3_business_info({business_id_or_alias: req.params.id})
  .then(({ data }) => {
    return res.status(200).json({success: true, restaurant: data});
  })
  .catch(err => {
    return res.status(500).json({success: false, err: err});
  });

})

module.exports = router;
