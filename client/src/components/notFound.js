const NotFound = (props) => {

    return (
        <div className="errorContainer">
            <h1 className="errorMessage">404 Not Found</h1>
            <a href="/">
                <button className="errorButton">Home</button>
            </a>
        </div>
    )
}
export default NotFound