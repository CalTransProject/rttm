import './styling/general.css'
const HistoricalGeneral = () => { 
    return(
        <section>
            <ul class="dropdown-menu">
                <li><a href="#">Parent Link 1</a>
                    <ul>
                    <li><a href="#">Child Link 1</a></li>
                    <li><a href="#">Child Link 2</a></li>
                    </ul>
                </li>
                <li><a href="#">Parent Link 2</a>
                    <ul>
                    <li><a href="#">Child Link 3</a></li>
                    <li><a href="#">Child Link 4</a></li>
                    </ul>
                </li>
            </ul>

        </section>
    )
}

export default HistoricalGeneral