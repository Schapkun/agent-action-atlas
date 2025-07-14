/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // LET OP: Zorg dat je NIET per ongeluk 'next export' draait.
  // We willen een server-build zodat /api routes werken.
  // (Standaard is output: 'server', dus hier niets extra’s nodig.)

  // Als je wél wilt dat Next.js ook de map 'src/pages' herkent, staat dat standaard aan:
  // je hoeft pageExtensions of zo niet aan te passen.

  // Mochten we ooit aliases willen gebruiken:
  // webpack(config) {
  //   config.resolve.alias['@preview'] = path.resolve(__dirname, 'preview_version/src/pages/api')
  //   return config
  // }
}

module.exports = nextConfig
