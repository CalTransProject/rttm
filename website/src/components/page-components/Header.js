import "bootstrap/dist/css/bootstrap.min.css";
import "./header.css";
import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <h1 className="logo col-2">RTTM</h1>
          <div className="navbar-nav col-8 justify-content-center">
            <NavLink exact to="/" className="nav-link" activeClassName="active">
              Home
            </NavLink>
            <NavLink exact to="/camera-management/general" className="nav-link" activeClassName="active">
              Camera Management
            </NavLink>
            <NavLink exact to="/historical-data/general" className="nav-link" activeClassName="active">
              Historical Data
            </NavLink>
            <NavLink exact to="/technologies" className="nav-link" activeClassName="active">
              Technologies
            </NavLink>
            <NavLink exact to="/about-us" className="nav-link" activeClassName="active">
              About Us
            </NavLink>
          </div>
          <div className="col-2 text-right">
            <NavLink exact to="/my-account" className="btn btn-primary">
              My Account
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
