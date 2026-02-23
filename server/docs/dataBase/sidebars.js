/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  dbSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Home',
    },
    {
      type: 'category',
      label: 'Core Documentation',
      collapsed: false,
      items: [
        'overview',
        'architecture',
        'enums',
        'performance',
      ],
    },
    {
      type: 'category',
      label: 'Domain Documentation',
      collapsed: false,
      items: [
        'domains/user-auth',
        'domains/complaints',
        'domains/routing-assignment',
        'domains/attendance',
        'domains/quiz-certification',
        'domains/rating-feedback',
      ],
    },
    {
      type: 'category',
      label: 'Table Reference',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Authentication',
          items: [
            'tables/role',
            'tables/users',
            'tables/auth_otp',
          ],
        },
        {
          type: 'category',
          label: 'Geographic Hierarchy',
          items: [
            'tables/geographic-hierarchy',
          ],
        },
        {
          type: 'category',
          label: 'Worker Management',
          items: [
            'tables/trashman_assignment',
            'tables/division_officers',
          ],
        },
        {
          type: 'category',
          label: 'Attendance',
          items: [
            'tables/attendance',
            'tables/geo_attendance',
          ],
        },
        {
          type: 'category',
          label: 'Complaints',
          items: [
            'tables/resident_complaints',
            'tables/immediate_tasks',
          ],
        },
        {
          type: 'category',
          label: 'Quiz System',
          items: [
            'tables/question_db',
            'tables/quiz_total_score_time',
            'tables/quiz_management',
            'tables/quiz_history',
          ],
        },
        {
          type: 'category',
          label: 'Rating & Feedback',
          items: [
            'tables/rating_auth',
            'tables/rating',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
