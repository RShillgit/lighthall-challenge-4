import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App';
import SingleRestaurant from './components/singleRestaurant';

const RouteSwitch = () => {

    const serverURL = 'http://localhost:8000';
    const clientURL = 'http://localhost:3000'

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App serverURL={serverURL} clientURL={clientURL}/>}/>
                <Route path='/restaurants/:restaurantID' element={<SingleRestaurant serverURL={serverURL} clientURL={clientURL}/>} />
                <Route path='*' />
            </Routes>
        </BrowserRouter>
    )
}
export default RouteSwitch;