import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

let records = null;

function loadCsv() {
  if (records) return records;

  const filePath = path.join(process.cwd(), 'idapi.csv'); // data.csv root me hona chahiye
  const fileContent = fs.readFileSync(filePath, 'utf8');

  const parsed = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  records = parsed;
  return records;
}

export default function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter "number" is required, e.g. /api/number?number=919113000255'
    });
  }

  try {
    const data = loadCsv();

    const item = data.find(row => row.Number === number);

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
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
                                }
