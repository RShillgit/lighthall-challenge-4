import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App';
import NotFound from './components/notFound';
import SingleRestaurant from './components/singleRestaurant';

const RouteSwitch = () => {

    const serverURL = 'https://bitter-eggnog-production.up.railway.app'; // http://localhost:8000 in development
    const clientURL = 'http://localhost:3000'

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App serverURL={serverURL} clientURL={clientURL}/>}/>
                <Route path='/restaurants/:restaurantID' element={<SingleRestaurant serverURL={serverURL} clientURL={clientURL}/>} />
                <Route path='*' element={<NotFound serverURL={serverURL} clientURL={clientURL}/>} />
            </Routes>
        </BrowserRouter>
    )
}
export default RouteSwitch;