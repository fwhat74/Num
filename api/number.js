import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let records = null;

function cleanValue(value) {
  if (!value) return "";
  return value.replace(/^"+|"+$/g, "").trim();
}

function loadCsv() {
  if (records) return records;

  const filePath = path.join(__dirname, '../idapi.csv');

  if (!fs.existsSync(filePath)) {
    throw new Error('CSV file not found');
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  const lines = fileContent.split('\n').filter(Boolean);

  const headers = lines[0]
    .split(',')
    .map(h => cleanValue(h));

  records = lines.slice(1).map(line => {
    const values = line.split(',');

    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = cleanValue(values[index]);
    });

    return obj;
  });

  return records;
}

export default function handler(req, res) {
  try {
    const { number } = req.query;

    if (!number) {
      return res.status(400).json({
        success: false,
        error: 'Use: /api/number?number=919606001060'
      });
    }

    const data = loadCsv();

    const result = data.find(row => row.Number === number);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Number not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
