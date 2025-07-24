export async function getServerSideProps({ params, res }) {
  const fs = require('fs');
  const path = require('path');
  const parts = params.all || [];
  let filePath = path.join(process.cwd(), 'preview_version', ...parts);

  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    return { props: { html: '404 - Not found' } };
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);

  if (ext === 'html') {
    return { props: { html: buffer.toString() } };
  }

  // Voor andere assets tonen we alleen een placeholder
  return { props: { html: `<pre>${filePath}</pre>` } };
}

export default function CatchAll({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
