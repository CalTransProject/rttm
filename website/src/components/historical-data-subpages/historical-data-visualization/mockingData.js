import fs from 'fs';
import path from 'path';

const glob = require('glob');
// ?ln.1 vs const fs = require('fs'); 
const { execSync } = require('child_process'); //read python file

const mockDataFiles = glob.sync('mockData/*.json'); // get mockData folder json files as array
const mockData = {}; // mockData object
// loop through array per file name
mockDataFiles.forEach((file) => {
    const fileName = file.split('/').pop();
    const data = JSON.parse(fs.readFileSync(file, 'utf8')); // read contents
    mockData[fileName] = data; //add parsed json to mockData object with file name as key
});
//
// execute and read output of GenerateData.py 
// const generateData = execSync('python GenerateData.py').toString(); 
// const generateDataObj = JSON.parse(generateData); //parse python data as JSON
// mockData.generateData = generateDataObj; // .generateData key adds parsed json to mockData 
// i.e: console.log(mockData.data_20230512_011641.json); accesses the 'data_20230512_011641.json' file.
//

//Dynamically get data based on User's selections
const generateData = {};

const loadData = (fileName, timeInterval, address) => { //parse data
    const dataFiles = fs.readdirSync('../');
    const filteredFiles = dataFiles.filter(file => { // filters
        const [fileName, fileExtension] = file.split('.'); // check if the file name matches 
        const [date, time] = fileName.split('_');
        const [year, month, day] = date.split('');
        const [hour, minute, second] = time.split('');
        // address?
        return (
            file.includes(fileName, fileExtension) &&
            time.includes(hour, minute, second) && date.includes(year, month, day) &&
            timeInterval.includes(hour)
            // TODO check other filters 
        );

    });

    if (filteredFiles.length > 0) {
        const filePath = path.join('./', filteredFiles[0]);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const jsondata = JSON.parse(fileData);
        return jsondata;
    } else {
        return null;
    }
};

console.log(mockData);

module.exports = mockData;
