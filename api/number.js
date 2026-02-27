import { parse } from 'csv-parse/sync';

let records = null;

// Apna base URL yahan set karo (production domain)
// e.g. https://num.vercel.app
const BASE_URL = process.env.BASE_URL || 'https://num.vercel.app'; // isko apne project ke URL se replace karo

async function loadCsv() {
  if (records) return records;

  try {
    const csvUrl = `${BASE_URL}/idapi.csv`;
    console.log('Fetching CSV from:', csvUrl);

    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }

    const fileContent = await response.text();

    const parsed = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log('CSV parsed, total rows:', parsed.length);
    records = parsed;
    return records;
  } catch (err) {
    console.error('Error while loading CSV via HTTP:', err);
    throw err;
  }
}

export default async function handler(req, res) {
  const { number } = req.query;

  if (!number) {
    return res.status(400).json({
      success: false,
      error: 'Query parameter "number" is required, e.g. /api/number?number=919606001060'
    });
  }

  try {
    const data = await loadCsv();

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
