import { useEffect, useRef, useState } from 'react';
import cuisineTypes from './components/cuisineType';
import cuisineMap  from './components/cuisineMap';
import './styles.css';

function App(props) {

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

  const [userInputsForm, setUserInputsForm] = useState();

  //autocomplete location
  const locationInputRef = useRef(null);

  const [restaurantSuggestions , setRestaurantSuggestions] = useState();
  const [restaurantsDisplay, setRestaurantsDisplay] = useState();

  const message = document.getElementById('error-message');
  const google = window.google;

  // On Mount
  useEffect(() => {
    // Check for restaurants in local storage
    const savedRestaurants = JSON.parse(localStorage.getItem('restaurants'));
    setRestaurantSuggestions(savedRestaurants);
  }, [])

  // Anytime locationCoordinateChoice changes rerender inputs
  useEffect(() => {
    setUserInputsForm(
      <>
        <form class='row' id='credentialsForm' onSubmit={generateRestaurants}>
        <div class='column' className='userOne'>
          {generateCredentialsSection('user1')}
        </div>
        <div class='column' className='formInputType'>
        <p>Cuisine Type</p>
        <p>Location</p>
        <p>Distance Within</p>
        <p>Open Now</p>
        <p>Price</p>
        <p>Rating</p>
        </div>  
        <div class='column' className='userTwo'>
          {generateCredentialsSection('user2')}
        </div>
        </form>
        <button className='submitSearch' form='credentialsForm'>Search</button>
        <button className='resetSearch' onClick={handleFormReset}>Reset</button>
      </>
    )
  }, [locationCoordinateChoice])

  // Anytime restaurantSuggestions change, rerender restaurants display
  useEffect(() => {
    setRestaurantsDisplay(allRestaurantsSection)
  }, [restaurantSuggestions])

  useEffect(() => {

    const autocompleteInputs = document.querySelectorAll('.input-location');

    autocompleteInputs.forEach(input => {
      new window.google.maps.places.Autocomplete(input);
    })

  }, [userInputsForm]);

  // Clear search results when component mounts or updates
  useEffect(() => {
    setRestaurantSuggestions([]);
  }, []);
  
  // User inputs form submit
  const generateRestaurants = async(e) => {
    const preparedData = await prepareUserData();
    if (!preparedData.formattedLocations.user1 || !preparedData.formattedLocations.user2) {
      cuisineChoice.current = { user1: null, user2: null };
      radiusChoice.current = { user1: {}, user2: {} };
      priceChoice.current = { user1: [], user2: [] };
      ratingChoice.current = { user1: null, user2: null };
      locationCoordinateChoice.current = { user1: null, user2: null };
      locationStringChoice.current = { user1: null, user2: null };
      alert('Please enter valid locations');
      return;
    }

    e.preventDefault();

    localStorage.removeItem('restaurants');
    
    // Prepare user data for API
    const formattedData = prepareUserData();
    console.log(formattedData);

    fetch(`${props.serverURL}/api`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      mode: 'cors',
      body: JSON.stringify({formattedData})
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      if (data.success) {
        // Clear any error message
        if(message){
          message.textContent = '';
        };
        localStorage.setItem('restaurants', JSON.stringify(data.restaurants));
        setRestaurantSuggestions(data.restaurants)
      }
      else{
        message.textContent = data.error + "\n\n Please Reset :)";
        setRestaurantSuggestions([]);
      }
    })
    .catch(err => console.log(err))
  }

  // Prepares user data to align with API format requirements
  const prepareUserData = async() => {

    // Format Cuisine Types
    let user1Cuisine = null;
    let user2Cuisine = null;

    if (cuisineChoice.current.user1 !== null) {
      user1Cuisine = cuisineMap[cuisineChoice.current.user1];
    }
    if (cuisineChoice.current.user2 !== null) {
      user2Cuisine = cuisineMap[cuisineChoice.current.user2];
    }

    let formattedCuisines =  {user1: user1Cuisine, user2: user2Cuisine};

      
    // Format Location & handle errors
    const locationInputs = document.querySelectorAll('.input-location');
    let user1Location = locationInputs[0].value;
    let user2Location = locationInputs[1].value;
    if (user1Location === 'Using Current Location') user1Location = null;
    if (user2Location === 'Using Current Location') user2Location = null;

    // Check if the locations are valid
    let validLocations = true;
    if (user1Location) {
      const geocoder = new google.maps.Geocoder();
      await new Promise((resolve, reject) => {
        geocoder.geocode({ address: user1Location }, (results, status) => {
          if (status !== 'OK') {
            user1Location = null;
            validLocations = false;
          }
          resolve();
        });
      });
    }
    if (user2Location) {
      const geocoder = new google.maps.Geocoder();
      await new Promise((resolve, reject) => {
        geocoder.geocode({ address: user2Location }, (results, status) => {
          if (status !== 'OK') {
            user2Location = null;
            validLocations = false;
          }
          resolve();
        });
      });
    }

    // If the locations are not valid, reset all the data and ask users to enter valid locations
    if (!validLocations) {
      cuisineChoice.current = { user1: null, user2: null };
      radiusChoice.current = { user1: {}, user2: {} };
      priceChoice.current = { user1: [], user2: [] };
      ratingChoice.current = { user1: null, user2: null };
      locationCoordinateChoice.current = { user1: null, user2: null };
      locationStringChoice.current = { user1: null, user2: null };
      alert('Please enter valid locations');
      return;
    }

    locationStringChoice.current = {
      user1: user1Location,
      user2: user2Location,
    };

    let formattedLocations = { ...locationStringChoice.current };
    if (!formattedLocations.user1) {
      formattedLocations = {
        ...formattedLocations,
        user1: locationCoordinateChoice.current.user1,
      };
    }
    if (!formattedLocations.user2) {
      formattedLocations = {
        ...formattedLocations,
        user2: locationCoordinateChoice.current.user2,
      };
    }

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
    } else radiiAverage = 40000; // Max Radius Value

    // TODO: Format Open now

    // Format Price into array of integers & handle errors
    let formattedPrice = [];
    let integerPricesArray = [];
    if(priceChoice.current.user1) integerPricesArray.push(priceChoice.current.user1.length);
    if(priceChoice.current.user2) integerPricesArray.push(priceChoice.current.user2.length); 
    if (integerPricesArray.length > 0) {
      for (let i = 1; i <= Math.max(...integerPricesArray); i++) {
        formattedPrice.push(i);
      }
    } else formattedPrice = [1, 2, 3, 4];
    
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
      formattedLocations,
      formattedRadius: radiiAverage,
      formattedPrice,
      formattedRating
    }
  }
  
  // Gets users longitude and latitude
  const getUserLocation = (user) => {

    // Alter input associated with this user
    const userLocationInput = document.getElementById(`location-input-${user}`);
    userLocationInput.value = 'Using Current Location';
    userLocationInput.readOnly = true;

    // Remove locationString for this user
    if (user === 'user1') {
      locationStringChoice.current = {
        ...locationStringChoice.current,
        user1: null
      }

    } else if (user === 'user2') {
      locationStringChoice.current = {
        ...locationStringChoice.current,
        user2: null
      }
    }

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (user === 'user1') {
          locationCoordinateChoice.current = {
            ...locationCoordinateChoice.current,
            user1: {
              latitude: latitude,
              longitude: longitude
            }
          }
        }
        else if (user === 'user2') {
          locationCoordinateChoice.current = {
            ...locationCoordinateChoice.current,
            user2: {
              latitude: latitude,
              longitude: longitude
            }
          }
        }

        setUserInputsForm(
          <>
            <form id='credentialsForm' onSubmit={generateRestaurants}>
            <div class='column' className='userOne'>
            {generateCredentialsSection('user1')}
          </div>
          <div class='column' className='formInputType'>
          <p>Cuisine Type</p>
          <p>Location</p>
          <p>Distance Within</p>
          <p>Open Now</p>
          <p>Price</p>
          <p>Rating</p>
          </div>  
          <div class='column' className='userTwo'>
            {generateCredentialsSection('user2')}
          </div>
          </form>
          <button className='submitSearch' form='credentialsForm'>Search</button>
          <button className='resetSearch' onClick={handleFormReset}>Reset</button>
          </>
        )
      },
      (error) => console.log(error)
    );
  };

  // Creates input secion for each user
  const generateCredentialsSection = (user) => {

    return (
      <div className='userCredentials'>
        <label>
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

        {(user === 'user1' && locationCoordinateChoice.current.user1.latitude && locationCoordinateChoice.current.user1.longitude)
          // If user1 is using current location 
          ? 
          <>
            <label>
              <input type="text" id={`location-input-${user}`} className='input-location' 
                readOnly={true} ref={locationInputRef}
                />
              <button type='button' title='Remove'><i class="fa fa-location-arrow" aria-hidden="true"></i></button>
            </label>
          </>
          :
          <>
            {(user === 'user2' && locationCoordinateChoice.current.user2.latitude && locationCoordinateChoice.current.user2.longitude)
              ?
              // Else if user2 is using current location display normal input
              <>
                <label>
                  <input type="text" id={`location-input-${user}`} className='input-location' 
                  readOnly={true} ref={locationInputRef}
                  />
                  <button type='button' title='Remove'><i class="fa fa-location-arrow" aria-hidden="true"></i></button>
                </label>
              </>
              :
              // Else display normal input
              <>
                <label>
                  <input 
                    type="text" 
                    id={`location-input-${user}`} 
                    className='input-location'
                    required={true}
                    ref={locationInputRef} // add a ref to access the DOM node later
                  />
                  <button type='button' title='Use Current Location' onClick={() => getUserLocation(user)}><i class="fa fa-location-arrow" aria-hidden="true"></i></button>
                </label>
              </>
            }
          </>
        }  

        <label>
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

        <label>
          <select>
            <option value="">Any</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
              
        </label>

        <label>
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

        <label>
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

  // All restaurants display
  const allRestaurantsSection = (
    <>
      {restaurantSuggestions
        ?
        <div className='restaurantSuggestionsContainer'>
          {restaurantSuggestions.map(restaurant => {
            return (
              <a href={`restaurants/${restaurant.id}`} className='individualRestaurant' key={restaurant.id}>
                <p className='restaurantName'>{restaurant.name}</p>
                <p>Rating: {restaurant.rating}</p>
              </a>
            )
            
          })}
        </div>
        :
        <></>
      }
    </>
  )

  //Reset Credential Section and Clear Results
  const handleFormReset = () => {
    // Reset cuisine choice for user1 and user2
    cuisineChoice.current = {
      user1: '',
      user2: ''
    }
    // Reset location coordinate choice for user1 and user2
    locationCoordinateChoice.current = {
      user1: { latitude: null, longitude: null },
      user2: { latitude: null, longitude: null }
    }
    // Reset radius choice for user1 and user2
    radiusChoice.current = {
      user1: { radius: null, units: 'Mi' },
      user2: { radius: null, units: 'Mi' }
    }
    // TODO: Reset open now choice for user1 and user2

    // Reset price choice for user1 and user2
    priceChoice.current = {
      user1: '',
      user2: ''
    }

    // Reset rating choice for user1 and user2
    ratingChoice.current = {
      user1: '',
      user2: ''
    }
    // Reset form fields
    const form = document.getElementById('credentialsForm');
    form.reset();

    //Reset Error Message
    //const message = document.getElementById('error-message');
    if(message){
      message.textContent = '';
    };

    // Clear any search results
    setRestaurantSuggestions([]);
  };

  return (
    <div className="App">
      <header>
        <h1>Yelp For Couples</h1>
      </header>
      <div className="credentialsInputContainer">
        {userInputsForm}
        <p id="error-message"></p>
      </div>
      {restaurantsDisplay}
    </div>
  );
}

export default App;
