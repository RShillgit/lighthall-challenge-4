import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../styles.css';

const SingleRestaurant = (props) => {

    const navigate = useNavigate();
    const {restaurantID} = useParams();
    const [currentRestaurant, setCurrentRestaurant] = useState();
    const allRestaurants = useRef();

    const hoursOfOperation = useRef();

    // On mount
    useEffect(() => {
        
        hoursOfOperation.current = [
            {
                day: 0,
                start: 10000, // If time returned < this it will update
                end: 0, // If time is > this it will update
            },
            {
                day: 1,
                start: 10000,
                end: 0,
            },
            {
                day: 2,
                start: 10000,
                end: 0,
            },
            {
                day: 3,
                start: 10000,
                end: 0,
            },
            {
                day: 4,
                start: 10000,
                end: 0,
            },
            {
                day: 5,
                start: 10000,
                end: 0,
            },
            {
                day: 6,
                start: 10000,
                end: 0,
            },
        ]

        // Get restaurant from local storage
        const storedRestaurants = JSON.parse(localStorage.getItem('restaurants'));
        if (storedRestaurants) {

            allRestaurants.current = storedRestaurants;
            const selectedRestaurant = allRestaurants.current.filter(restaurant => restaurant.id === restaurantID)[0];
            if (selectedRestaurant) {

                fetch(`${props.serverURL}/api/${restaurantID}`, {
                    headers: { "Content-Type": "application/json" },
                    mode: 'cors',
                })
                .then(res => res.json())
                .then(data => {
                    console.log(data);

                    // Format hours of operation array
                    const currentHours = data.restaurant.hours[0].open;
                    for (let i = 0; i < currentHours.length; i ++) {
                        for(let j = 0; j < 7; j++) {
                            
                            if(currentHours[i].day === j) {  
                                const dayIndex = hoursOfOperation.current.findIndex(day => day.day === j);
                                const dayFound = hoursOfOperation.current[dayIndex];

                                if (currentHours[i].start < dayFound.start) {
                                    dayFound.start = currentHours[i].start;
                                }
                                if (currentHours[i].end > dayFound.end) {
                                    dayFound.end = currentHours[i].end;
                                }
                            }
                        }
                    }
                    setCurrentRestaurant(data.restaurant);
                })
                .catch(err => console.log(err))
    
            } else navigate('/');
        } 
        else navigate('/');
        
    }, [])

    const formatRestaurantHours = (dayHours) => {

        let openTime = dayHours.start;
        let closeTime = dayHours.end;

        if(Number(openTime) > 1200) {
            openTime = openTime - 1200; 
            const openTimeSplit = openTime.toString().split('');
            openTime = `${openTimeSplit[0]}${openTimeSplit[1]}:${openTimeSplit[2]}${openTimeSplit[3]} PM`;
        } 
        else if (Number(openTime) === 1200) {
            
            openTime = '12:00 PM';
        }
        else if (Number(openTime) === 0) {
            openTime = '12:00 AM';
        }
        else {
            const openTimeSplit = openTime.toString().split('');
            openTime = `${openTimeSplit[0]}${openTimeSplit[1]}:${openTimeSplit[2]}${openTimeSplit[3]} AM`;
        }
        if (Number(closeTime) > 1200) {
            closeTime = closeTime - 1200;
            if (closeTime.toString().length < 4) {
                closeTime = `0${closeTime}`;
            }
            const closeTimeSplit = closeTime.toString().split('');
            closeTime = `${closeTimeSplit[0]}${closeTimeSplit[1]}:${closeTimeSplit[2]}${closeTimeSplit[3]} PM`;
        } 
        else if(Number(closeTime) === 1200) {
            closeTime = '12:00 PM';
        }
        else if (Number(closeTime) === 0) {
            closeTime = '12:00 AM';
        }
        else {
            const closeTimeSplit = closeTime.toString().split('');
            closeTime = `${closeTimeSplit[0]}${closeTimeSplit[1]}:${closeTimeSplit[2]}${closeTimeSplit[3]} AM`;
        }

        return (
            {
                openTime: openTime,
                closeTime: closeTime
            }
        )

    }

    const restaurantNavigation = () => {

        // Find the index of the current restaurant is in the array of all restaurants
        const currentRestaurantIndex = allRestaurants.current.findIndex(rest => rest.id === restaurantID);

        // First restaurant
        if (currentRestaurantIndex === 0) {
            const nextRestaurantID = allRestaurants.current[currentRestaurantIndex + 1].id;
            return (
                <a className="restaurantNav" href={`/restaurants/${nextRestaurantID}`}>
                    <button>Next</button>
                </a>
            )
        }
        // Last restaurant
        else if (currentRestaurantIndex === allRestaurants.current.length - 1) {
            const previousRestaurantID = allRestaurants.current[currentRestaurantIndex - 1].id;
            return (
                <a className="restaurantNav" href={`/restaurants/${previousRestaurantID}`}>
                    <button>Previous</button>
                </a>
            )

        }
        // All the other restaurants
        else {
            const nextRestaurantID = allRestaurants.current[currentRestaurantIndex + 1].id;
            const previousRestaurantID = allRestaurants.current[currentRestaurantIndex - 1].id;
            return (
                <>
                    <a className="restaurantNav" href={`/restaurants/${previousRestaurantID}`}>
                        <button>Previous</button>
                    </a>
                    <a className="restaurantNav" href={`/restaurants/${nextRestaurantID}`}>
                        <button>Next</button>
                    </a>
                </>
            )
        }
    }

    return (
        <div className="App">
        <header>
            <h1 className='headerBar'>Yelp For Couples</h1>
        </header>

        <div  className='currentRestaurantContainer'>
        {currentRestaurant
                ?
                <>
                    <a className="restaurantNav" href='/'>
                        <button>Home</button>
                    </a>

                    <div className='imageBanner'>
                        <img src={currentRestaurant.photos[0]}></img>
                        <img src={currentRestaurant.photos[1]}></img>
                        <img src={currentRestaurant.photos[2]}></img>
                    </div>

                    <div className='currentRestaurant'>

                        <a className="yelpLink" href={currentRestaurant.url} target="_blank" rel="noreferrer">
                            <h1 className='currentName'>{currentRestaurant.name}</h1>
                        </a>
                    
                        <p>
                            <span>{currentRestaurant.price} </span> &#x2022; 
                            {currentRestaurant.categories.map((category, i) => {

                                if(i === currentRestaurant.categories.length - 1) {
                                    return (
                                        <span key={category.title}> {category.title}</span>
                                    )
                                } else {
                                    return (
                                        <span key={category.alias}> {category.title}, </span>
                                    )
                                }
                            })}
                        </p>

                        <div className="restaurantHours">
                            {currentRestaurant.hours[0].is_open_now
                                ?
                                <span className="openClose">Open</span>
                                :
                                <span className="openClose">Closed</span>
                            }
                            {hoursOfOperation.current.map(dayHours => {
                                // Javascript day indexes 0=sunday, 6=saturday
                                // API day indexes 0=monday, 6=sunday
                                // Current day
                                let currentDay = new Date().getDay() - 1;
                                if (currentDay === -1) {
                                    currentDay = 6;
                                }

                                if(dayHours.day === currentDay) {

                                    const storeHours = formatRestaurantHours(dayHours);

                                    return (<span key={dayHours.day}> {storeHours.openTime} - {storeHours.closeTime}</span>)
                                }
                                else return null;
                            })}
                        </div>

                        <p>Rating: {currentRestaurant.rating}</p>
                        <p>Phone: {currentRestaurant.display_phone}</p>
                    </div>
                </>
                :
                <></>
            }

            {currentRestaurant && allRestaurants.current
                ?
                <div className="restaurantNavigation">
                    {restaurantNavigation()}
                </div>
                :<></>
            }
        </div>
        
            
        </div>
    )

}
export default SingleRestaurant;