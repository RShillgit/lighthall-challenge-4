import { useEffect, useRef, useState } from 'react';
import cuisineTypes from './components/cuisineType';
import cuisineMap  from './components/cuisineMap';
import './styles.css';
import Rating from 'react-rating';

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

  const openChoice = useRef({
    user1: null,
    user2: null
  })

  const priceChoice = useRef({
    user1: null,
    user2: null
  });

  const [userInputsForm, setUserInputsForm] = useState();

  //autocomplete location
  const locationInputRef = useRef(null);

  const [restaurantSuggestions , setRestaurantSuggestions] = useState();
  const [restaurantsDisplay, setRestaurantsDisplay] = useState();

  const [randomRestaurant, setRandomRestaurant] = useState();

  const message = document.getElementById('error-message');

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
  
  // User inputs form submit
  const generateRestaurants = (e) => {
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
  const prepareUserData = () => {

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
    if(user1Location === 'Using Current Location') user1Location = null;
    if(user2Location === 'Using Current Location') user2Location = null;
    
    locationStringChoice.current = {
      user1: user1Location,
      user2: user2Location,
    }

    let formattedLocations = {...locationStringChoice.current};
    if (!formattedLocations.user1) {
      formattedLocations = {
        ...formattedLocations,
        user1: locationCoordinateChoice.current.user1
      }
    }
    if (!formattedLocations.user2) {
      formattedLocations = {
        ...formattedLocations,
        user2: locationCoordinateChoice.current.user2
      }
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

    // Format Open now
    let formattedOpenNow = {
      user1: null,
      user2: null,
    }

    if (openChoice.current.user1 === 'Yes') {
      formattedOpenNow = {
        ...formattedOpenNow,
        user1: true
      }
    }
    if (openChoice.current.user2 === 'Yes') {
      formattedOpenNow = {
        ...formattedOpenNow,
        user2: true
      }
    }
    if (openChoice.current.user1 === 'No') {
      formattedOpenNow = {
        ...formattedOpenNow,
        user1: false
      }
    }
    if (openChoice.current.user2 === 'No') {
      formattedOpenNow = {
        ...formattedOpenNow,
        user2: false
      }
    }

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
    
    return {
      formattedCuisines,
      formattedLocations,
      formattedRadius: radiiAverage,
      formattedOpenNow,
      formattedPrice,
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

  // Removes users longitude and latitude
  const removeUserLocation = (user) => {

    if (user === 'user1') {
      locationCoordinateChoice.current = {
        ...locationCoordinateChoice.current,
        user1: {
          latitude: null,
          longitude: null
        }
      }
    }
    else if (user === 'user2') {
      locationCoordinateChoice.current = {
        ...locationCoordinateChoice.current,
        user2: {
          latitude: null,
          longitude: null
        }
      }
    }

    // Alter input associated with this user
    const userLocationInput = document.getElementById(`location-input-${user}`);
    userLocationInput.value = '';

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
        </div>  
        <div class='column' className='userTwo'>
          {generateCredentialsSection('user2')}
        </div>
        </form>
        <button className='submitSearch' form='credentialsForm'>Search</button>
        <button className='resetSearch' onClick={handleFormReset}>Reset</button>
      </>
    )
  }

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
              <button type='button' title='Remove' onClick={() => removeUserLocation(user)}><i class="fa fa-location-arrow" aria-hidden="true"></i></button>
            </label>
          </>
          :
          <>
            {(user === 'user2' && locationCoordinateChoice.current.user2.latitude && locationCoordinateChoice.current.user2.longitude)
              ?
              // Else if user2 is using current location
              <>
                <label>
                  <input type="text" id={`location-input-${user}`} className='input-location' 
                  readOnly={true} ref={locationInputRef}
                  />
                  <button type='button' title='Remove' onClick={() => removeUserLocation(user)}><i class="fa fa-location-arrow" aria-hidden="true"></i></button>
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
          <select className='credentialsSelection' onChange={(e) => {
              // User1 Selection
              if (user === 'user1') {
                openChoice.current = {
                  ...openChoice.current,
                  user1: e.target.value
                }
              }
              // User2 Selection
              else if (user === 'user2') {
                openChoice.current = {
                  ...openChoice.current,
                  user2: e.target.value
                }
              }
          }}>
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
      </div>
    )
  }

  const randomlySelectRestaurant = () => {

    const randomSelection = restaurantSuggestions[Math.floor(Math.random() * restaurantSuggestions.length)];
    setRandomRestaurant(randomSelection);

    // Open modal
    const modal = document.getElementById('randomlySelectedRestaurant');
    modal.showModal();
  }

  // All restaurants display
  const allRestaurantsSection = (
    <>
      {restaurantSuggestions
        ?
        <div className='restaurantSuggestionsContainer'>

          <div className='chooseRandomRestaurant'>
            <button onClick={randomlySelectRestaurant} id="openRandomlySelectedRestaurant">Choose For Me</button>
          </div>

          {restaurantSuggestions.map(restaurant => {
            return (
              <a href={`restaurants/${restaurant.id}`} className='individualRestaurant' key={restaurant.id}>
                <img className='imageIcon' src={restaurant.image_url} alt={restaurant.name} width='150' height='150' ></img>
                <div className='restaurantInfo'>
                  <p className='restaurantName'>{restaurant.name}</p>
                  <p><Rating 
                    id='rating'
                    name="half-rating-read" 
                    initialRating={restaurant.rating} 
                    precision={0.5} 
                    emptySymbol={['fa fa-star-o fa-2x']}
                    fullSymbol={['fa fa-star fa-2x']}
                    readonly />
                  </p>
                  
                  <p>{restaurant.categories.map((category, i) => {

                    if(i === restaurant.categories.length - 1) {
                        return (
                            <span className='restaurantCategory' key={category.title}> {category.title}</span>
                        )
                    } else {
                      return (
                          <span className='restaurantCategory' key={category.alias}> {category.title} </span>
                      )
                  }
                  })}
                    </p>
                </div>
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
      user1: null,
      user2: null
    }
    // Reset location string choice for user1 and user 2
    locationStringChoice.current = {
      user1: null,
      user2: null
    };
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
    // Reset open now choice for user1 and user2
    openChoice.current = {
      user1: null,
      user2: null
    }

    // Reset price choice for user1 and user2
    priceChoice.current = {
      user1: null,
      user2: null
    }

    // Reset form fields
    const form = document.getElementById('credentialsForm');
    form.reset();

    //Reset Error Message
    //const message = document.getElementById('error-message');
    if(message){
      message.textContent = '';
    };

    // Remove restaurants from local storage
    localStorage.removeItem('restaurants');

    // Clear any search results
    setRestaurantSuggestions([]);

    // Reset user inputs form
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
        </div>  
        <div class='column' className='userTwo'>
          {generateCredentialsSection('user2')}
        </div>
        </form>
        <button className='submitSearch' form='credentialsForm'>Search</button>
        <button className='resetSearch' onClick={handleFormReset}>Reset</button>
      </>
    )
  };

  return (
    <div className="App">
    <header className='headerBar'>
      <h1>Yelp For Couples</h1>
    </header>
      
      <div className="credentialsInputContainer">
        {userInputsForm}
        <p id="error-message"></p>
      </div>
      {restaurantsDisplay}

      <dialog id='randomlySelectedRestaurant'>
        {randomRestaurant
          ?
          <div className='randomRestaurantInfo'>
            <a href={`/restaurants/${randomRestaurant.id}`}  className='individualRestaurant'>
              <img className='imageIcon' src={randomRestaurant.image_url} alt={randomRestaurant.name} width='150' height='150' ></img>
                <div className='restaurantInfo'>
                  <p className='restaurantName'>{randomRestaurant.name}</p>
                  <p><Rating 
                    name="half-rating-read" 
                    initialRating={randomRestaurant.rating} 
                    precision={0.5} 
                    emptySymbol={['fa fa-star-o fa-2x medium']}
                    fullSymbol={['fa fa-star fa-2x medium']}
                    
                    readonly />
                  </p>
                  
                  <p>{randomRestaurant.categories.map((category, i) => {

                    if(i === randomRestaurant.categories.length - 1) {
                        return (
                            <span className='restaurantCategory' key={category.title}> {category.title}</span>
                        )
                    } else {
                      return (
                          <span className='restaurantCategory' key={category.alias}> {category.title} </span>
                      )
                  }
                  })}
                    </p>
                </div>
            </a>
          </div>
          :
          <></>
        }
        <div className='closeModalButton'>
          <button id='closeRandomlySelectedRestaurant' onClick={() => {
            const modal = document.getElementById('randomlySelectedRestaurant');
            modal.close();
          }}>Close</button>
        </div>
      </dialog>

    </div>
  );
}

export default App;
