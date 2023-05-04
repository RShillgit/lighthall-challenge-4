import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SingleRestaurant = (props) => {

    const navigate = useNavigate();
    const {restaurantID} = useParams();
    const [currentRestaurant, setCurrentRestaurant] = useState();

    // On mount
    useEffect(() => {

        // Get restaurant from local storage
        const allRestaurants = JSON.parse(localStorage.getItem('restaurants'));
        if (allRestaurants) {

            fetch(`${props.serverURL}/api/${restaurantID}`, {
                headers: { "Content-Type": "application/json" },
                mode: 'cors',
            })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setCurrentRestaurant(data.restaurant);
            })
            .catch(err => console.log(err))

        } else {
            navigate('/')
        }

    }, [])

    const formatRestaurantHours = (dayHours) => {

        let openTime = dayHours.start;
        let closeTime = dayHours.end;

        if(openTime > 1200) {
            openTime = openTime - 1200;
            const openTimeSplit = openTime.toString().split('');
            openTime = `${openTimeSplit[0]}${openTimeSplit[1]}:${openTimeSplit[2]}${openTimeSplit[3]} PM`;
        } else {
            const openTimeSplit = openTime.toString().split('');
            openTime = `${openTimeSplit[0]}${openTimeSplit[1]}:${openTimeSplit[2]}${openTimeSplit[3]} AM`;
        }
        if (closeTime > 1200) {
            closeTime = closeTime - 1200;
            const closeTimeSplit = closeTime.toString().split('');
            closeTime = `${closeTimeSplit[0]}${closeTimeSplit[1]}:${closeTimeSplit[2]}${closeTimeSplit[3]} PM`;
        } else {
            console.log(closeTime)
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

    return (
        <div>
            {currentRestaurant
                ?
                <div>
                    <a href={currentRestaurant.url} target="_blank" rel="noreferrer">
                        <h1>{currentRestaurant.name}</h1>
                    </a>
                
                    <p>
                        <span>{currentRestaurant.price} </span> * 
                        {currentRestaurant.categories.map((category, i) => {

                            if(i === currentRestaurant.categories.length - 1) {
                                return (
                                    <span key={category.alias}> {category.title}</span>
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
                            <span>Open</span>
                            :
                            <span>Closed</span>
                        }
                        {currentRestaurant.hours[0].open.map(dayHours => {

                            // Current day
                            const currentDay = new Date().getDay();

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
                :
                <></>
            }

            <a href='/'>
                <button>Home</button>
            </a>
        </div>
    )

}
export default SingleRestaurant;