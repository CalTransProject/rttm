import React from 'react';
import HistoricalSidebarMenu from './subcomponents/sub-historical-data/SideBarMenu';
import { Outlet } from 'react-router-dom'; // Import Outlet

const HistoricalData = () => {
  return (
    <section>
      <HistoricalSidebarMenu />
      <Outlet /> {/* Nested routes will render here */}
    </section>
  );
}

export default HistoricalData;