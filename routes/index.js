var express = require('express');
var router = express.Router();

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

  console.log(req.body)

  /*
  sdk.v3_business_search({
    location: 'NYC', 
    term: 'restaurants',
    radius: 8000, // RADIUS MUST BE IN METERS -> 8000m = ~5miles
    open_now: true, // CAN ALSO USE open_at with unix time 
    // attributes: Lots of stuff from outdoor_seating to restaurants_delivery, etc.
    sort_by: 'best_match', // best_match, rating, review_count, distance
    limit: '5' // Max 50
  })
  .then(({ data }) => {
    return res.status(200).json({success: true, restaurants: data})
  })
  .catch(err => {
    return res.status(500).json({success: false, err})
  });
  */
})

module.exports = router;
