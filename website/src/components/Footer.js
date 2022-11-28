import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => { 
    return (
        <footer>
            <h6><Button variant="secondary" disabled>Home</Button></h6>
            <h6><Button>Technologies</Button></h6>
            <h6><Button>Sign in / Sign up</Button></h6>
        </footer>
    )
} 

export default Footer
