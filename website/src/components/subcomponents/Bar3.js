import React, { useEffect, useRef } from 'react';
import echarts from 'echarts';
import axios from 'axios';

const Bar3 = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    axios.get('./')
      .then((response) => {
        const data = response.data;
        const chart = echarts.init(chartRef.current);
        const options = {
          xAxis: {
            type: 'category',
            data: data.categories,
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              data: data.values,
              type: 'bar',
            },
          ],
        };
        chart.setOption(options);
      });
  }, []);

  return (
    <echarts chartRef={chartRef} />
  );
};

export default Bar3;
