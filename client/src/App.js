import { useEffect, useRef, useState } from 'react'
import cuisineTypes from "./components/cuisineType"
import './styles.css';

function App() {

  const cuisineChoice = useRef({
    user1: null,
    user2: null
  });

  const locationStringChoice = useRef({
    user1: null,
    user2: null
  });

  const locationCoordinateChoice = useRef({
    user1: {
      longitude: null,
      latitude: null,
    },
    user2: {
      longitude: null,
      latitude: null,
    }
  })

  const radiusChoice = useRef({
    user1: {
      units: 'Mi',
      radius: null,
    },
    user2: {
      units: 'Mi',
      radius: null,
    },
  })

  const priceChoice = useRef({
    user1: null,
    user2: null
  });

  const ratingChoice = useRef({
    user1: null,
    user2: null
  })
  
  // User inputs form submit
  const generateRestaurants = (e) => {
    e.preventDefault();
    
    // Prepare user data for API
    const formattedData = prepareUserData();
    console.log(formattedData);

    fetch(`http://localhost:8000/api`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      mode: 'cors',
      body: JSON.stringify({formattedData})
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.log(err))
  }

  // Prepares user data to align with API format requirements
  const prepareUserData = () => {

    // Format Cuisines into array of strings & handle errors
    let formattedCuisines = null;
    if (cuisineChoice.current.user1 && cuisineChoice.current.user2) {
      formattedCuisines = [cuisineChoice.current.user1, cuisineChoice.current.user2];
    }
    else if (cuisineChoice.current.user1) {
      formattedCuisines = [cuisineChoice.current.user1];
    }
    else if (cuisineChoice.current.user2) {
      formattedCuisines = [cuisineChoice.current.user2];
    }

    // Format Location & handle errors
    console.log("location",locationStringChoice.current)

    // Format Radii into average radius & handle errors
    let userRadiiObjects = [];
    let radiiAverage;
    if (radiusChoice.current.user1.radius) userRadiiObjects.push(radiusChoice.current.user1);
    if (radiusChoice.current.user2.radius) userRadiiObjects.push(radiusChoice.current.user2);
    
    if (userRadiiObjects.length > 0) {
      let userRadiiValues = [];
      userRadiiObjects.forEach(radiusObject => {  
        if (radiusObject.units === 'Mi') {
          userRadiiValues.push(Math.ceil(radiusObject.radius * 1609.34));
        }
        else if (radiusObject.units === 'Km') {
          userRadiiValues.push(Math.ceil(radiusObject.radius * 1000));
        }
      })
      radiiAverage = Math.ceil(userRadiiValues.reduce((sum, value) => (sum + value)) / userRadiiValues.length);  
    } else radiiAverage = null;

    // Format Price into array of integers & handle errors
    let formattedPrice = [];
    let integerPricesArray = [];
    if(priceChoice.current.user1) integerPricesArray.push(priceChoice.current.user1.length);
    if(priceChoice.current.user2) integerPricesArray.push(priceChoice.current.user2.length); 
    if (integerPricesArray.length > 0) {
      for (let i = 1; i <= Math.max(...integerPricesArray); i++) {
        formattedPrice.push(i);
      }
    } else formattedPrice = null;
    
    // Format Rating into object with min and max ratings & handle errors
    let userRatings = null;
    let formattedRating = null;
    if (ratingChoice.current.user1 && ratingChoice.current.user2) { 
      userRatings = ((ratingChoice.current.user1.split('-')).concat(ratingChoice.current.user2.split('-')) )
    }
    else if (ratingChoice.current.user1) {
      userRatings = ((ratingChoice.current.user1.split('-')));
    }
    else if (ratingChoice.current.user2) {
      userRatings = ((ratingChoice.current.user2.split('-')));
    }

    if (userRatings) {
      userRatings = userRatings.map(rating => {
        return Number(rating);
      })
      formattedRating = {
        min: Math.min(...userRatings),
        max: Math.max(...userRatings)
      }
    }

    return {
      formattedCuisines,
      formattedRadius: radiiAverage,
      formattedPrice,
      formattedRating
    }
  }

  
  
  //autocomplete location
  const locationInputRef = useRef(null);

  useEffect((user) => {
    const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current);
  
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      locationCoordinateChoice.current.user2.latitude = place.geometry.location.lat();
      locationCoordinateChoice.current.user2.longitude = place.geometry.location.lng();
    });
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = locationCoordinateChoice.current[user];
          location.latitude = latitude;
          location.longitude = longitude;
        },
        (error) => console.log(error)
      );
    }
  
  }, [locationInputRef]);

  // Gets users longitude and latitude
  const getUserLocation = (user) => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = locationCoordinateChoice.current[user];
        location.latitude = latitude;
        location.longitude = longitude;
      },
      (error) => console.log(error)
    );
  
    const autocomplete = new window.google.maps.places.Autocomplete(document.getElementById("location-input"));
  
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const location = locationCoordinateChoice.current[user];
        location.latitude = place.geometry.location.lat();
        location.longitude = place.geometry.location.lng();
      }
    });
  };
  

  // Creates input secion for each user
  const generateCredentialsSection = (user) => {

    return (
      <div className='userCredentials'>
        <label> Cuisine Type:
          <select onChange={(e) => {
            // User1 Selection
            if (user === 'user1') {
              cuisineChoice.current = {
                ...cuisineChoice.current,
                user1: e.target.value
              }
            }
            // User2 Selection
            else if (user === 'user2') {
              cuisineChoice.current = {
                ...cuisineChoice.current,
                user2: e.target.value
              }
            }
          }}>
            <option value="">Any</option>
            {cuisineTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </label>


        <label> Location:
          <input 
            type="text" 
            id="location-input" 
            onChange={(e) => {
              // User1 Selection
              if (user === 'user1') {
                // Handle empty string
                if (e.target.value === '') {
                  locationStringChoice.current = {
                    ...locationStringChoice.current,
                    user1: null
                  }
                } else {
                  locationStringChoice.current = {
                    ...locationStringChoice.current,
                    user1: e.target.value
                  }
                }
              }
              // User2 Selection
              else if (user === 'user2') {
                // Handle empty string
                if (e.target.value === '') {
                  locationStringChoice.current = {
                    ...locationStringChoice.current,
                    user2: null
                  }
                } else {
                  locationStringChoice.current = {
                    ...locationStringChoice.current,
                    user2: e.target.value
                  }
                }
              }
            }}
            ref={locationInputRef} // add a ref to access the DOM node later
          />
          <button onClick={getUserLocation}>Use Current Location</button>
        </label>

        <label> Distance Within:
            <input type="number" min="1" onChange={(e) => {
              // User1 Selection
              if (user === 'user1') {
                // Handle empty string
                if (e.target.value === '') {
                  radiusChoice.current = {
                    ...radiusChoice.current,
                    user1: {
                      ...radiusChoice.current.user1,
                      radius: null
                    }
                  }
                }
                else {
                  radiusChoice.current = {
                    ...radiusChoice.current,
                    user1: {
                      ...radiusChoice.current.user1,
                      radius: e.target.value
                    }
                  }
                }
              }
              // User2 Selection
              else if (user === 'user2') {
                // Handle empty string
                if (e.target.value === '') {
                  radiusChoice.current = {
                    ...radiusChoice.current,
                    user2: {
                      ...radiusChoice.current.user2,
                      radius: null
                    }
                  }
                }
                else {
                  radiusChoice.current = {
                    ...radiusChoice.current,
                    user2: {
                      ...radiusChoice.current.user2,
                      radius: e.target.value
                    }
                  }
                }
              }
            }} />
            <select className='credentialsSelection' required={true} onChange={(e) => {
              // User1 Selection
              if (user === 'user1') {
                radiusChoice.current = {
                  ...radiusChoice.current,
                  user1: {
                    ...radiusChoice.current.user1,
                    units: e.target.value
                  }
                }
              }
              // User2 Selection
              else if (user === 'user2') {
                radiusChoice.current = {
                  ...radiusChoice.current,
                  user2: {
                    ...radiusChoice.current.user2,
                    units: e.target.value
                  }
                }
              }
            }}>
              <option value="Mi">Mi</option>
              <option value="Km">Km</option>
            </select>
        </label>

        <label> Open Now:
          <select>
              <option value="">Any</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
          </select>
              
        </label>

        <label> Price:
          <select className='credentialsSelection' onChange={(e) => {
            // User1 Selection
            if (user === 'user1') {
              priceChoice.current = {
                ...priceChoice.current,
                user1: e.target.value
              }
            }
            // User2 Selection
            else if (user === 'user2') {
              priceChoice.current = {
                ...priceChoice.current,
                user2: e.target.value
              }
            }
          }}>
            <option value="">Any</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
            <option value="$$$$">$$$$</option>
          </select>
        </label>

        <label> Rating:
          <select className='credentialsSelection' onChange={(e) => {
            // User1 Selection
            if (user === 'user1') {
              ratingChoice.current = {
                ...ratingChoice.current,
                user1: e.target.value
              }
            }
            // User2 Selection
            else if (user === 'user2') {
              ratingChoice.current = {
                ...ratingChoice.current,
                user2: e.target.value
              }
            }
          }}>
            <option value="">Any</option>
            <option value="0-1">0-1 Stars</option>
            <option value="1-2">1-2 Stars</option>
            <option value="2-3">2-3 Stars</option>
            <option value="3-4">3-4 Stars</option>
            <option value="4-5">4-5 Stars</option>
          </select>
        </label>
      </div>
    )
  }

  return (
    <div className="App">
      <h1>Yelp For Couples</h1> 
      
      <div className="credentialsInputContainer">

        <form id='credentialsForm' onSubmit={generateRestaurants}>
          {generateCredentialsSection('user1')}
          {generateCredentialsSection('user2')}
        </form>
        <button form='credentialsForm'>Generate Restaurant</button>
      </div>
    </div>
  );
}

export default App;
