import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar } from "react-bootstrap";

const Footer = () => { 
    return (
    // <div>
    //     <Navbar class="navbar navbar-expand-lg bg-white">
    //         {/* <Button variant="secondary" disabled>Home</Button> */}
    //         <div class="col"  style={{display:'flex', flexDirection:'row' ,alignItems: 'center'}}>
    //             <button type="button" class="btn btn-link" disabled>Home</button>
    //             <button type="button" class="btn btn-link">Technologies</button>
    //             <button type="button" class="btn btn-link">Login/SignUp</button>
    //         </div>
    //         {/* <Button>Technologies</Button>
    //         <Button>Login/Sign up</Button> */}
    //     </Navbar>
    // </div>
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
