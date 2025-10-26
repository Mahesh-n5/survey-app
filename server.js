const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const EXCEL_FILE = path.join('/data', 'surveys.xlsx');
const DOWNLOAD_PASSWORD = 'mahesh@123'; // Replace with a strong, unique password

app.post('/submit', (req, res) => {
    const data = req.body;
    
    let wb;
    let isNew = false;
    
    if (fs.existsSync(EXCEL_FILE)) {
        wb = XLSX.readFile(EXCEL_FILE);
    } else {
        wb = XLSX.utils.book_new();
        isNew = true;
    }
    
    let ws;
    if (isNew) {
        ws = XLSX.utils.json_to_sheet([data]);
        XLSX.utils.book_append_sheet(wb, ws, 'Responses');
    } else {
        ws = wb.Sheets['Responses'];
        XLSX.utils.sheet_add_json(ws, [data], {skipHeader: true, origin: -1});
    }
    
    XLSX.writeFile(wb, EXCEL_FILE);
    
    res.send('Survey submitted!');
});

app.get('/download', (req, res) => {
    if (req.query.pass === DOWNLOAD_PASSWORD) {
        if (fs.existsSync(EXCEL_FILE)) {
            res.download(EXCEL_FILE, 'survey_responses.xlsx');
        } else {
            res.status(404).send('No data yet');
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));