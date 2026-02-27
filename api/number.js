import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

let records;

function loadCsv() {
  if (records) return records;

  const filePath = path.join(process.cwd(), 'idapi.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return records;
}

export default function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({
      success: false,
      error: 'Use: /api/number?number=XXXXXXXXXX'
    });
  }

  try {
    const data = loadCsv();

    // ⚠️ Yaha column name EXACT match hona chahiye CSV header se
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
      error: 'Server error'
    });
  }
}
