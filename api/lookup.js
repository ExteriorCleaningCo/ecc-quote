export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
 
  const { postcode } = req.query;
  if (!postcode) { res.status(400).json({ error: 'Postcode required' }); return; }
 
  const clean = postcode.replace(/\s+/g, '').toUpperCase();
  const formatted = clean.slice(0, -3) + ' ' + clean.slice(-3);
 
  try {
    const response = await fetch(
      'https://api.ideal-postcodes.co.uk/v1/postcodes/' + encodeURIComponent(formatted) + '?api_key=ak_mowobf7dE7Lufy9K0U8bVsm2JXSON',
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await response.json();
 
    if (data.result && data.result.length > 0) {
      const addresses = data.result.map(a => ({
        line_1: a.line_1 || '',
        line_2: a.line_2 || '',
        line_3: a.line_3 || '',
        line_4: '',
        locality: a.dependent_locality || '',
        town_or_city: a.post_town || '',
        county: a.county || '',
      }));
      res.status(200).json({ addresses });
    } else {
      res.status(200).json({ addresses: [], message: 'No addresses found for this postcode.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed', detail: err.message });
  }
}
 
