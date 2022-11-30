import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
  return (
    <header>
        <nav class="navbar navbar-expand-lg navbar-light bg-black">
          <div class="col-sm-4">
            <h1>RTTM</h1>
          </div>
          <div class="col-8">
            <Button variant="secondary" disabled>Home</Button>
            <Button>Technologies</Button>
            <Button>Login/Sign Up</Button>
          </div>
        </nav>  
    </header>
  )
}

export default Header
