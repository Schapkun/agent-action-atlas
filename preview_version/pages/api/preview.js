// pages/api/preview.js

import fs from 'fs';
import path from 'path';

export default (req, res) => {
  const previewPath = path.join(process.cwd(), 'preview_version'); // Pad naar de preview_version map
  const files = fs.readdirSync(previewPath);  // Lees de bestanden in de preview_version map

  res.status(200).json({ files });  // Stuur de lijst van bestanden als JSON naar de frontend
};
