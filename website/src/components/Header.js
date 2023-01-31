import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import './header.css';

const Header = () => {
  return (
    <header>
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <div class="col-sm-5" className = 'div-header'>
            <h1>RTTM</h1>
          </div>
          <div class="col-7"  style={{display:'flex', flexDirection:'row' ,alignItems: 'center'}}>
            <ul class="navbar-nav">
              <li class="nav-item">
                <a href="#" class="nav-link">Home</a>
                <a href="#" class="nav-link">Technologies</a>
                <a href="#" class="nav-link">Login/SignUp</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
