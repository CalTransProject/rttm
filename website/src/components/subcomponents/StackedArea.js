import ReactEcharts from "echarts-for-react"; 

const StackedArea = () =>{
  const option = {
    title: {
      text: ''
    },
    tooltip: {},
    legend: {
      data: ['']
    },
    xAxis: {
      name:'Time',
      nameLocation:'middle',
      nameGap:30,
      nameTextStyle:{
          fontSize:18,
          fontWeight:'bold'
      },
      data: ['1', '2', '3', '4', '5', '6', '7', '8','9', '10', 
      '11', '12', '13', '14', '15', '16','17', '18', '19', '20',
       '21', '22', '23', '24','25', '26', '27', '28', '29', '30',
       '31', '32', '33', '34', '35', '36', '37', '38','39', '40', 
       '41', '42', '43', '44', '45', '46','47', '48', '49', '50',
        '51', '52', '53', '54','55', '56', '57', '58', '59', '60',]
    },
    yAxis: {
      name:'Number of Vehicles',
      nameLocation:'middle',
      nameGap:30,
      nameTextStyle:{
          fontSize:18,
          fontWeight:'bold'
      },
      nameRotate:90,
      data: []
  },
    series: [
      {
        name: '',
        type: 'line',
        data: []
      },
      {
        name: '',
        type: 'line',
        data: []
      },
    ]
  };
return( <ReactEcharts option={option} />);
} 
export default StackedArea;