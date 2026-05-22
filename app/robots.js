// app/robots.js

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app', '/compte', '/success', '/api/'],
      },
    ],
    sitemap: 'https://hookgenerator.eu/sitemap.xml',
    host: 'https://hookgenerator.eu',
  };
}