import MainPicture from './subcomponents/MainPicture';
import Body from './subcomponents/sub-s3-components/Body';
import HistoricalSidebarMenu from './subcomponents/sub-historical-data/SideBarMenu';
import HistoricalDataVisualizationFilter from './subcomponents/sub-historical-data/HistoricalDataVisualizationFilter.js';
const HistoricalData = () => {
    return (
        <section>
            <HistoricalSidebarMenu />
            <HistoricalDataVisualizationFilter />
        </section>

    )
}

export default HistoricalData