import ReactEcharts from "echarts-for-react"; 

const StackedBar = () =>{
   const option = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'bar'
      }
    ]
  };


return( <ReactEcharts option={option} />);
} 
export default StackedBar;