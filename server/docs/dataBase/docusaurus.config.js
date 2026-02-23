// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Database Documentation',
  tagline: 'Complete technical documentation for Trash Management SaaS database',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'your-org', // Usually your GitHub org/user name.
  projectName: 'trash-management-db-docs', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/', // Serve docs at site root
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: undefined,
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Database Docs',
        logo: {
          alt: 'Database Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'dbSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'http://localhost:5000/api-docs',
            label: 'API Docs',
            position: 'right',
          },
          {
            href: 'http://localhost:3000',
            label: 'Frontend Docs',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Database Docs',
            items: [
              {
                label: 'Overview',
                to: '/overview',
              },
              {
                label: 'Architecture',
                to: '/architecture',
              },
              {
                label: 'Performance',
                to: '/performance',
              },
            ],
          },
          {
            title: 'Domains',
            items: [
              {
                label: 'User Authentication',
                to: '/domains/user-auth',
              },
              {
                label: 'Complaints',
                to: '/domains/complaints',
              },
              {
                label: 'Routing & Assignment',
                to: '/domains/routing-assignment',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Backend API',
                href: 'http://localhost:5000/api-docs',
              },
              {
                label: 'Frontend Docs',
                href: 'http://localhost:3000',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Trash Management System. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'sql'],
      },
    }),
};

export default config;
