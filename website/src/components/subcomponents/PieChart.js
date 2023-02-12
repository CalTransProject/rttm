import ReactEcharts from "echarts-for-react"; 

const PieChart = () =>{
   const option = {
    title: {
      text: 'Percentage of vehicles',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: '', name: 'SUV' },
          { value: '', name: 'Sedan' },
          { value: '', name: 'Car' },
          { value: '', name: 'Truck' },
          { value: '', name: 'Bus' }
        ],
      }
    ]
  };
return( <ReactEcharts option={option} />);
} 
export default PieChart;