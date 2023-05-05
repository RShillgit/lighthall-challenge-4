var express = require('express');
var router = express.Router();
const async = require('async');

// Yelp SDK
const sdk = require('api')('@yelp-developers/v1.0#deudoolf6o9f51');

sdk.auth('Bearer fSxcLW2UZE5mCMllnwKp3ScxTtNq0WZtk97g8EC7JYigyFyqqox6gE2KWjYpdzkhag3UgEpcrbVOFlPa38o9_siMkhXqGYtS3sXjk0eWlMOuIB43J0pCgSa5S0ZRZHYx');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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

  let openNow1;
  let openNow2;

  if (req.body.formattedData.formattedOpenNow.user1 === true || req.body.formattedData.formattedOpenNow.user1 === false) {
    openNow1 = req.body.formattedData.formattedOpenNow.user1
  }
  else {
    openNow1 = true;
  }
  if (req.body.formattedData.formattedOpenNow.user2 === true || req.body.formattedData.formattedOpenNow.user2 === false) {
    openNow2 = req.body.formattedData.formattedOpenNow.user2
  }
  else {
    openNow1 = true;
  }

  const price = req.body.formattedData.formattedPrice;

  // Searches with/without open_now and location string/coordinates
  const openNowWithCoords1 = (callback) => {
    sdk.v3_business_search({
      latitude: location1.latitude,
      longitude: location1.longitude,
      term: 'restaurants',
      categories: cuisine1,
      radius: radius,
      price: price,
      open_now: openNow1,
      sort_by: 'best_match',
      limit: '5' // Max 50
    })
    .then(data => {
      callback(null, data)
    })
  }
  const openNowWithCoords2 = (callback) => {
    sdk.v3_business_search({
      latitude: location2.latitude,
      longitude: location2.longitude,
      term: 'restaurants',
      categories: cuisine2,
      radius: radius,
      price: price,
      open_now: openNow2,
      sort_by: 'best_match',
      limit: '5' // Max 50
    })
    .then(data => {
      callback(null, data)
    })
  }
  const openNowWithoutCoords1 = (callback) => {
    sdk.v3_business_search({
      location: location1, 
      term: 'restaurants',
      categories: cuisine1,
      radius: radius,
      price: price,
      open_now: openNow1,
      sort_by: 'best_match', 
      limit: '5' // Max 50
    })
    .then(data => {
      callback(null, data)
    })
  }
  const openNowWithoutCoords2 = (callback) => {
    sdk.v3_business_search({
      location: location2, 
      term: 'restaurants',
      categories: cuisine2,
      radius: radius,
      price: price,
      open_now: openNow2,
      sort_by: 'best_match', 
      limit: '5' // Max 50
    })
    .then(data => {
      callback(null, data)
    })
  }
  const noOpenNowWithCoords1 = (callback) => {
    sdk.v3_business_search({
      latitude: location1.latitude,
      longitude: location1.longitude,
      term: 'restaurants',
      categories: cuisine1,
      radius: radius,
      price: price,
      sort_by: 'best_match',
      limit: '5' // Max 50
    })
    .then(data => {
      callback(null, data)
    })
  }
  const noOpenNowWithoutCoords1 = (callback) => {
    sdk.v3_business_search({
      location: location1, 
      term: 'restaurants',
      categories: cuisine1,
      radius: radius,
      price: price,
      sort_by: 'best_match', 
      limit: '5' // Max 50
    })
    .then(data => {
      callback(null, data)
    })
  }
  const noOpenNowWithCoords2 = (callback) => {
    sdk.v3_business_search({
      latitude: location2.latitude,
      longitude: location2.longitude,
      term: 'restaurants',
      categories: cuisine2,
      radius: radius,
      price: price,
      sort_by: 'best_match',
      limit: '5' // Max 50
    })
    .then(data => {
      callback(null, data)
    })
  }
  const noOpenNowWithoutCoords2 = (callback) => {
    sdk.v3_business_search({
      location: location2, 
      term: 'restaurants',
      categories: cuisine2,
      radius: radius,
      price: price,
      sort_by: 'best_match', 
      limit: '5' // Max 50
    })
    .then(data => {
      callback(null, data)
    })
  }

  async.parallel(
    {
      location1Search(callback) {
        // Latitude/Longitude location
        if (typeof(location1) === 'object') {
          if(openNow1 === true || openNow1 === false) {
            openNowWithCoords1(callback)
          }
          else {
            noOpenNowWithCoords1(callback)
          }
        } 
        // String location
        else {
          if(openNow1 === true || openNow1 === false) {
            openNowWithoutCoords1(callback)
          }
          else {
            noOpenNowWithoutCoords1(callback)
          }
        }
      },
      location2Search(callback) {

        // Latitude/Longitude location
        if (typeof(location2) === 'object') {
          if(openNow2 === true || openNow2 === false) {
            openNowWithCoords2(callback)
          }
          else {
            noOpenNowWithCoords2(callback)
          }
        } 
        // String location
        else {
          if(openNow2 === true || openNow2 === false) {
            openNowWithoutCoords2(callback)
          }
          else {
            noOpenNowWithoutCoords2(callback)
          }
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
