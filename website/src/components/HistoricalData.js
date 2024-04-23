// HistoricalData.js

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HistoricalSidebarMenu from './subcomponents/sub-historical-data/SideBarMenu';
import HistoricalGeneral from './historical-data-subpages/HistoricalGeneral';
import HistoricalUpload from './historical-data-subpages/HistoricalUpload';
import HistoricalDownload from './historical-data-subpages/HistoricalDownload';

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
          </Routes>
        </div>
      </div>
    </section>
  );
};

export default HistoricalData;