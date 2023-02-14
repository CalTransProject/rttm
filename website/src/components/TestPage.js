import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
//import Chart from "react-apexcharts";
import React, {useState} from "react";
import StackedArea from './subcomponents/StackedArea';
import StackedBar from './subcomponents/Bar';
import PieChart from './subcomponents/PieChart';
import './subcomponents/charts.css'
import Body from './Body';

const TestPage = () => { 
    return(
        <section>    
            <Body />
        </section>
    )
}

export default TestPage