import { useEffect, useRef, useState } from 'react'
import Credentials from './components/credentials';
import './styles.css';

function App() {

  const cuisineChoice = useRef({
    user1: null,
    user2: null
  });

  const locationChoice = useRef({
    user1: null,
    user2: null
  });

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

  useEffect(() => {
    fetch(`http://localhost:8000/api`)
    .then(res => res.json())
    .then(data => console.log(data))
  }, [])


  const generateCredentialsSection = (user) => {

    return (
      <div className='userCredentials'>
        <label> Cuisine Type:
            <input type="text" onChange={(e) => {
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
            }}/>
        </label>

        <label> Location:
          <input type="text" onChange={(e) => {
            // User1 Selection
            if (user === 'user1') {
              locationChoice.current = {
                ...locationChoice.current,
                user1: e.target.value
              }
            }
            // User2 Selection
            else if (user === 'user2') {
              locationChoice.current = {
                ...locationChoice.current,
                user2: e.target.value
              }
            }
          }}/>
          <button>Use Current Location</button>
        </label>

        <label> Distance:
            <input type="number" onChange={(e) => {
              // User1 Selection
              if (user === 'user1') {
                radiusChoice.current = {
                  ...radiusChoice.current,
                  user1: {
                    ...radiusChoice.current.user1,
                    radius: e.target.value
                  }
                }
              }
              // User2 Selection
              else if (user === 'user2') {
                radiusChoice.current = {
                  ...radiusChoice.current,
                  user2: {
                    ...radiusChoice.current.user2,
                    radius: e.target.value
                  }
                }
              }
              console.log(radiusChoice.current)
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
              console.log(radiusChoice.current)
            }}>
              <option value="Mi">Mi</option>
              <option value="Km">Km</option>
            </select>
        </label>

        <label> Open Now:
          <input type="text" name=''/>
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
          }} required={true}>
            <option value="Any">Any</option>
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
            console.log(ratingChoice.current)
          }} required={true}>
            <option value="Any">Any</option>
            <option value="Any">0-1 Stars</option>
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
        {generateCredentialsSection('user1')}
        {generateCredentialsSection('user2')}
      </div>
    </div>
  );
}

export default App;
