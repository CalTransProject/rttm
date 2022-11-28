import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
  return (
    <header>
        <div class="container-fluid">
          <div class="row">
              <div class="col-sm-4">
                <h1>RTTM</h1>
              </div>
              <div class="col-8">
                <Button variant="secondary" disabled>Home</Button>
                <Button>Technologies</Button>
                <Button>Sign in/ Sign Up</Button>
              </div>
          </div>

        </div>
        
    </header>
  )
}

export default Header
