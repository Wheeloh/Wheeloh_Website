/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://wheeloh.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/admin'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
    ],
    additionalSitemaps: [
      'https://wheeloh.com/sitemap.xml',
    ],
  },
}  