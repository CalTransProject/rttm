import ReactEcharts from "echarts-for-react"; 

const StackedBar = () =>{
   const option = {
    title:{
      text:'Speed',
      textStyle: {
        color: 'white'
      },
    },
    tooltip: {},
    legend:{
      data: ['']
    },
    xAxis: {
      name: 'Hour',
      nameTextStyle:{
        color: '#fff',
        fontSize:12,
        fontWeight:'bold'
    },
    axisLine:{
      lineStyle: {
        color: 'white'
      }
    },
      data: ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', 
      '8:00', '9:00', '10:00', '11:00', '12:00','13:00','14:00', '15:00', '16:00', 
      '17:00','18:00', '19:00', '20:00', '21:00' , '22:00', '23:00'],
      dataTextStyle:{
        color: 'white'
      },
    },
    yAxis: {
      name: 'Average Speed of Vehicles',
      nameLocation:'middle',
      nameGap:30,
      nameTextStyle:{
          color: 'white',
          fontSize:18,
          fontWeight:'bold'
      },
      axisLine:{
        lineStyle: {
          color: 'white'
        }
      },
      nameRotate:90,
      data: ['20', '40', '60', '80','100'],
    },
    series: [
      {
        name: ' ',
        type: 'bar',
        data: []
      },
      {
        name: ' ',
        type: 'bar',
        data: []
      }
    ]
  };

return( <ReactEcharts option={option} />);
} 
export default StackedBar;