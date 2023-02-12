var myChart = echarts.init(document.getElementById('main'));
var myChart2 = echarts.init(document.getElementById('main2'));
var myChart3 = echarts.init(document.getElementById('main3'));
var myChart4 = echarts.init(document.getElementById('main4'));

myChart.setOption({

        title: {
            text: 'Numbers'
        },
        tooltip: {},
        legend: {
            data:['']
        },
        xAxis: {
            name:'Detection Zone/Frame ID',
            nameLocation:'middle',
            nameGap:30,
            nameTextStyle:{
                fontSize:18,
                fontWeight:'bold'
            },
            data: []
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
            name: ' ',
            type: 'line',
            data: []
        },
            {
            name: ' ',
            type: 'line',
            data: []
        }
        ]
    });
myChart2.setOption({

        title: {
            text: 'Classification'
        },
        tooltip: {},
        legend: {
            data:['label']
        },
         xAxis: {
            name:'Type of vehicles',
            nameLocation:'middle',
            nameGap:30,
            nameTextStyle:{
                fontSize:18,
                fontWeight:'bold'
            },
            data: []
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
        series: [ {
            name: 'truck',
            type: 'bar',
            data: []
        }
        ]

    }
    );
myChart3.setOption({

        title: {
            text: 'Density'
        },
        tooltip: {},
        legend: {
            data:['']
        },
        xAxis: {
            name:'Time',
            nameLocation:'middle',
            nameGap:30,
            nameTextStyle:{
                fontSize:18,
                fontWeight:'bold'
            },
            data: []
        },
        yAxis: {
            name:'%',
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
            name: ' ',
            type: 'line',
            data: []
        },
            {
            name: ' ',
            type: 'line',
            data: []
        }
        ]
    });
myChart4.setOption({

        title: {
            text: 'Speed'
        },
        tooltip: {},
        legend: {
            data:['']
        },
        xAxis: {
            name:'Time',
            nameLocation:'middle',
            nameGap:30,
            nameTextStyle:{
                fontSize:18,
                fontWeight:'bold'
            },
            data: []
        },
        yAxis: {
            name:'%',
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
            name: ' ',
            type: 'line',
            data: []
        },
            {
            name: ' ',
            type: 'line',
            data: []
        }
        ]
    });
var time = ["","","","","","","","","",""],truck = [0,0,0,0,0,0,0,0,0,0],vehicle = [0,0,0,0,0,0,0,0,0,0]
var time2 = ["","","","","",""],truck2 = [0,0,0,0,0,0],vehicle2 = [0,0,0,0,0,0]
var time3 = ["","","","","",""],truck3 = [0,0,0,0,0,0],vehicle3 = [0,0,0,0,0,0]
var time4 = ["","","","","",""],truck4 = [0,0,0,0,0,0],vehicle4 = [0,0,0,0,0,0]
var update_mychart = function (res) {
        //res is the response instance of json format
        // hide the loading animations 
        myChart.hideLoading();
        myChart2.hideLoading();
        myChart3.hideLoading();
        myChart4.hideLoading();
        //receive data
        let localData = res.preds;
        let countVehicle = 0,countTruck = 0;

        // prepare the data 
        console.log(res);
        time.push(res.fid);
        truck.push(res.Truck);
        vehicle.push(res.Vehicle)
        if (time.length >= 10){
            time.shift();
            truck.shift();
            vehicle.shift();
        }

        time2.push(res.fid);
        truck2.push(res.Truck);
        vehicle2.push(res.Vehicle)
        if (time2.length >= 6){
            time2.shift();
            truck2.shift();
            vehicle2.shift();
        }

        time3.push(res.fid);
        truck.push(res.Truck);
        vehicle.push(res.Vehicle)
        if (time.length >= 10){
            time.shift();
            truck.shift();
            vehicle.shift();
        }

        time4.push(res.fid);
        truck.push(res.Truck);
        vehicle.push(res.Vehicle)
        if (time.length >= 10){
            time.shift();
            truck.shift();
            vehicle.shift();
        }



        // load the data into the charts
        myChart.setOption({
             legend: {
                data:[localData[0].label,localData[1].label,localData[2].label]
            // data:[res[0].label,res[1].label,res[2].label]
        },
            xAxis: {
                data: time
            },
            series: [{
                name: 'truck',
                // name: res[0].label , // feed the data to the corrsponding series
                data: truck
            },
            {
                name:'vehicle',
                // name: res[0].label , // feed the data to the corrsponding series
                data: vehicle
            }
            ]
        });
        myChart2.setOption({
             legend: {
                data:[localData[0].label,localData[1].label,localData[2].label]
            // data:[res[0].label,res[1].label,res[2].label]
        },
            xAxis: {
                data: ['truck','sedan','pick-up','car','suv','bus',]
            },
            series:  [ {
            name: 'truck',
            type: 'bar',
            data: vehicle2
            }
            ]
        });

        myChart3.setOption({
             legend: {
                data:[localData[0].label,localData[1].label,localData[2].label]
            // data:[res[0].label,res[1].label,res[2].label]
        },
            xAxis: {
                data: ['1min','5min','15min','20min','25min','30min',]
            },
            series: [{
                name: 'truck',
                // name: res[0].label , // feed the data to the corrsponding series
                data: truck
            },
            {
                name:'vehicle',
                // name: res[0].label , // feed the data to the corrsponding series
                data: vehicle
            }
            ]
        });
        myChart4.setOption({
             legend: {
                data:[localData[0].label,localData[1].label,localData[2].label]
            // data:[res[0].label,res[1].label,res[2].label]
        },
            xAxis: {
                data: ['1min','5min','15min','20min','25min','30min',]
            },
            series:  [ {
            name: 'truck',
            type: 'line',
            data: vehicle2
            }
            ]
        });


        };
myChart.showLoading();
myChart2.showLoading();
myChart3.showLoading();
myChart4.showLoading();
$(document).ready(function() {
    namespace = '/test';
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

    socket.on('server_response', function(res) {
        console.log(res.data);
        console.log(typeof(res.data));
        const result=JSON.parse(res.data);
        update_mychart(result);
    });
});