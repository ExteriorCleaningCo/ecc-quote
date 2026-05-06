export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
 
  const { postcode } = req.query;
  if (!postcode) { res.status(400).json({ error: 'Postcode required' }); return; }
 
  const clean = postcode.replace(/\s+/g,'').toUpperCase();
 
  try {
    // Use postcodes.io to validate + get location, then use OS Places for addresses
    const pcRes = await fetch('https://api.postcodes.io/postcodes/' + encodeURIComponent(clean));
    const pcData = await pcRes.json();
 
    if (pcData.status !== 200 || !pcData.result) {
      res.status(200).json({ addresses: [], message: 'Postcode not found' });
      return;
    }
 
    // Use Royal Mail PAF via postcodes.io addresses endpoint
    const addrRes = await fetch('https://api.postcodes.io/postcodes/' + encodeURIComponent(clean) + '/addresses');
    const addrData = await addrRes.json();
 
    if (addrData.status === 200 && addrData.result && addrData.result.addresses) {
      const addresses = addrData.result.addresses.map(a => ({
        line_1: a.line_1 || '',
        line_2: a.line_2 || '',
        line_3: a.line_3 || '',
        line_4: '',
        locality: a.locality || '',
        town_or_city: a.town_or_city || pcData.result.admin_district || '',
        county: a.county || pcData.result.admin_county || '',
      }));
      res.status(200).json({ addresses });
    } else {
      // Fallback: return area-level info so at least postcode fills in
      const r = pcData.result;
      const town = r.admin_district || r.parish || '';
      const county = r.admin_county || r.region || '';
      res.status(200).json({
        addresses: [{
          line_1: '',
          line_2: '',
          line_3: '',
          line_4: '',
          locality: '',
          town_or_city: town,
          county: county,
        }],
        fallback: true
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed', detail: err.message });
  }
}
 
