const express = require('express');
const XLSX = require('xlsx');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Store submissions in memory (temporary, resets on server restart)
let submissions = [];

// Password for downloading the Excel file (replace with a strong, unique password)
const DOWNLOAD_PASSWORD = 'maheshn5';

app.post('/submit', (req, res) => {
    const data = req.body;
    submissions.push(data); // Store submission in memory
    res.send('Survey submitted!');
});

app.get('/download', (req, res) => {
    if (req.query.pass !== DOWNLOAD_PASSWORD) {
        return res.status(401).send('Unauthorized');
    }

    if (submissions.length === 0) {
        return res.status(404).send('No data yet');
    }

    // Create Excel workbook and sheet from in-memory submissions
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(submissions);
    XLSX.utils.book_append_sheet(wb, ws, 'Responses');

    // Generate Excel file buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=survey_responses.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
