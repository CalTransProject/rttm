// //import {} from ;
import React, { useEffect, useState } from 'react';
import { mockData, getEntries, toGraphData } from './mockingData';
import { line } from 'react-chartsjs-2';
import { Video, Graph } from '../sub-s3-components';
import '../sub-s3-components/videoPlayer.css';


// import '../index.css';

const Chart = require('chart.js')