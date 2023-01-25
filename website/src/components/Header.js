import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import './header.css';

const Header = () => {
  return (
    <header>
        <nav class="navbar navbar-expand-lg navbar-light bg-black">
          {/* <div class="wrapper"> */}
            <div class="col-sm-5" className = 'div-header'>
              <h1>RTTM</h1>
            </div>
            <div class="col-8"  style={{display:'flex', flexDirection:'row' ,alignItems: 'center'}}>
              <Button variant="secondary" disabled>Home</Button>
              <Button>Technologies</Button>
              <Button>Login/Sign Up</Button>
            </div>
          {/* </div> */}
        </nav>
    </header>
  )
}

export default Header
