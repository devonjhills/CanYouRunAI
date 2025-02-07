/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.canyourunai.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/404"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://www.canyourunai.com/sitemap.xml"],
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
};
