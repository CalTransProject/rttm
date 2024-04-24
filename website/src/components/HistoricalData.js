// HistoricalData.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HistoricalSidebarMenu from './subcomponents/sub-historical-data/SideBarMenu';
import HistoricalGeneral from './historical-data-subpages/HistoricalGeneral';
import HistoricalUpload from './historical-data-subpages/HistoricalUpload';
import HistoricalDownload from './historical-data-subpages/HistoricalDownload';
import UploadTrafficStream from './historical-data-subpages/UploadTrafficStream';
import ManageTrafficStream from './historical-data-subpages/ManageTrafficStream';
import EditTrafficStream from './historical-data-subpages/EditTrafficStream';

const HistoricalData = () => {
  return (
    <section>
      <div className="row">
        <div className="col-3">
          <HistoricalSidebarMenu />
        </div>
        <div className="col-9">
          <Routes>
            <Route path="general" element={<HistoricalGeneral />} />
            <Route path="upload" element={<HistoricalUpload />} />
            <Route path="download" element={<HistoricalDownload />} />
            <Route path="upload-traffic-stream" element={<UploadTrafficStream />} />
            <Route path="manage-traffic-stream" element={<ManageTrafficStream />} />
            <Route path="edit-stream/:streamId" element={<EditTrafficStream />} />
          </Routes>
        </div>
      </div>
    </section>
  );
};

export default HistoricalData;