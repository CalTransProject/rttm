import "bootstrap/dist/css/bootstrap.min.css";
import "./header.css";
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <div class="col-1" className="div-header">
            <h1 class="logo">RTTM</h1>
          </div>
          <div class="col justify-content-center">
            <ul class="navbar-nav">
              <li class="nav-item">
                <NavLink exact to="/" className="nav-link" activeClassName="active">
                  Home
                </NavLink>
              </li>
              <li class="nav-item">
                <NavLink exact to="/camera-management/general" className="nav-link" activeClassName="active">
                  Camera Management
                </NavLink>
              </li>
              <li class="nav-item">
                <NavLink exact to="/historical-data/general" className="nav-link" activeClassName="active">
                Historical Data
                </NavLink>
              </li>
              <li class="nav-item">
                <NavLink exact to="/technologies" className="nav-link" activeClassName="active">
                Technologies
                </NavLink>
              </li>
              <li class="nav-item">
                <NavLink exact to="/about-us" className="nav-link" activeClassName="active">
                About Us
                </NavLink>
              </li>
            </ul>
          </div>
          <div class="col-1" className="div-header"></div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
