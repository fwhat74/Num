import { parse } from 'csv-parse/sync';

let records;

async function loadCsv() {
  if (records) return records;

  // Direct relative import using fetch from same deployment
  const response = await fetch(
    new URL('../../idapi.csv', import.meta.url)
  );

  const text = await response.text();

  records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  return records;
}

export default async function handler(req, res) {
  try {
    const { number } = req.query;

    if (!number) {
      return res.status(400).json({
        success: false,
        error: 'Use: /api/number?number=919606001060'
      });
    }

    const data = await loadCsv();

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
    console.error("REAL ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
