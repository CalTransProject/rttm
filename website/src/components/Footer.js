import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => { 
    return (
    <nav class="navbar navbar-light bg-light">
        <div class="p-3">
            <a class="text-dark text-center">
                <button type="button" class="btn btn-link" disabled>Home</button>
                <button type="button" class="btn btn-link">Technologies</button>
                <button type="button" class="btn btn-link">Login/SignUp</button>
            </a>
        </div>
    </nav>
    )
} 

export default Footer
