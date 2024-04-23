import MainPicture from './subcomponents/MainPicture';
import Body from './subcomponents/sub-s3-components/Body';
import HistoricalSidebarMenu from './subcomponents/sub-historical-data/SideBarMenu';
import HistoricalGeneral from './historical-data-subpages/HistoricalGeneral';
import HistoricalUpload from './historical-data-subpages/HistoricalUpload';
import HistoricalDownload from './historical-data-subpages/HistoricalDownload';

const HistoricalData = () => {
  return (
    <section>
      <HistoricalSidebarMenu />
      <HistoricalGeneral />
      {/* <HistoricalUpload />
      <HistoricalDownload /> */}
    </section>
  );
};

export default HistoricalData;