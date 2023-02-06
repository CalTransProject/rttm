// Login and Sign Up Main Page
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Chart from "react-apexcharts";
import React, {useState} from "react";
import MainPicture from './subcomponents/MainPicture';

const LoginMain = () => { 
    return(
        <section>
            {/* The below atm is for testing purposes and is not formatted */}
            <div class="text-box">
                <MainPicture />
            </div>
        </section>
    )
}

export default LoginMain