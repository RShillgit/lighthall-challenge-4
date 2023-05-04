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

                    <p>
                        <span>{currentRestaurant.is_closed}</span>
                        <span></span>
                    </p>

                    
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