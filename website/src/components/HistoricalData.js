import MainPicture from './subcomponents/MainPicture';
import Body from './subcomponents/sub-s3-components/Body';
import HistoricalSidebarMenu from './subcomponents/sub-historical-data/SideBarMenu';

const HistoricalData = () => { 
    return(
        <section>
            <div className="CameraManagement">
                <HistoricalSidebarMenu />
            </div>
        </section>
    )
}

export default HistoricalData