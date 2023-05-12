import "bootstrap/dist/css/bootstrap.min.css";
import "./footer.css";

const Footer = () => { 
    return (
        <footer id="sticky-footer" class="flex-shrink-0 py-4 bg-light text-white-50">
            <div className="footer-all">
                <small>
                    <a href="/home" className="footer-links" 
                        class="footer-link">Home
                    </a>
                    <a className="footer-links" href="/camera-management"
                         class="footer-link">Camera Management
                    </a>
                    <a className="footer-links" href="/historical-data"
                         class="footer-link">Historical Data
                    </a>
                    <a className="footer-links" href="/technologies"
                         class="footer-link">Technologies
                    </a>
                    <a className="footer-links" href="/about-us"
                       class="footer-link">About Us
                    </a>
                    
                </small>
            </div>
            <div class="footer-line"></div>
        </footer>
    )
} 

export default Footer
