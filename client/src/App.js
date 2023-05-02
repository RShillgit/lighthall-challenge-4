import { useEffect, useState } from 'react'

function App() {

  useEffect(() => {
    fetch(`http://localhost:8000/api`)
    .then(res => res.json())
    .then(data => console.log(data)) 

  }, [])

  return (
    <div className="App">
      <h1>Yelp For Couples</h1> 
    </div>
  );
}

export default App;
