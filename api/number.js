import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let records;

function loadCsv() {
  if (records) return records;

  // Go one level up from /api folder
  const filePath = path.join(__dirname, '../idapi.csv');

  if (!fs.existsSync(filePath)) {
    throw new Error('CSV file not found at: ' + filePath);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');

  records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
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
