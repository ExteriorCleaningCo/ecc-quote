export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
 
  const { postcode } = req.query;
  if (!postcode) { res.status(400).json({ error: 'Postcode required' }); return; }
 
  try {
    const response = await fetch(
      'https://api.getaddress.io/find/' + encodeURIComponent(postcode) + '?api-key=zH1aG1G8vESi0GQXdIgKHA51872&expand=true'
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Lookup failed', detail: err.message });
  }
}
 
