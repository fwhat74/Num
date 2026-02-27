import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

let records = null;

function loadCsv() {
  if (records) return records;

  try {
    // yahi se idapi.csv read kar rahe hain
    const filePath = path.join(process.cwd(), 'idapi.csv');
    console.log('Trying to read CSV from:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('CSV file not found at:', filePath);
      throw new Error('CSV file not found');
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');

    const parsed = parse(fileContent, {
      columns: true,          // pehli row headers hai
      skip_empty_lines: true,
      trim: true
    });

    console.log('CSV parsed, total rows:', parsed.length);
    records = parsed;
    return records;
  } catch (err) {
    console.error('Error while loading CSV:', err);
    throw err;
  }
}

export default function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter "number" is required, e.g. /api/number?number=919606001060'
    });
  }

  try {
    const data = loadCsv();

    // CSV header me "Number" capital N ke sath hai, wohi use kar rahe hain
    const item = data.find((row) => row.Number === number);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Number not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
