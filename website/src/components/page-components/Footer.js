import "bootstrap/dist/css/bootstrap.min.css";
import "./footer.css";

const Footer = () => { 
    return (
        <footer id="sticky-footer" class="flex-shrink-0 py-4 bg-light text-white-50">
            <div class="container text-center">
                <small>
                    <a className="footer-links" href="/">
                        <button type="button" class="btn btn-link">Home</button>
                    </a>
                    <a className="footer-links" href="/technologies">
                        <button type="button" class="btn btn-link">Technologies</button>
                    </a>
                    {/* <a className="footer-links" href="/">
                        <button type="button" class="btn btn-link">Login/SignUp</button>
                    </a> */}
                </small>
            </div>
        </footer>
    )
} 

export default Footer
