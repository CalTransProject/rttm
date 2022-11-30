import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => { 
    return (
    <div>
        <footer class="text-center text-lg-start bg-white text-muted fixed-bottom">
            <Button variant="secondary" disabled>Home</Button>
            <Button class="navbar-toggler"
                type="button"
                data-mdb-toggle="collapse"
                data-mdb-target="#navbarExample01"
                aria-controls="navbarExample01"
                aria-expanded="false"
                aria-label="Toggle navigation">Technologies</Button>
            <Button>Login/Sign up</Button>
        </footer>
    </div>
    )
} 

export default Footer
