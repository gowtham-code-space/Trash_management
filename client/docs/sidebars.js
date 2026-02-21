// @ts-check

/**
 * Trash Management System - Frontend Documentation
 * Structured sidebar navigation for production-grade technical documentation
 * 
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  documentationSidebar: [
    'introduction',
    
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture/overview',
        'architecture/folder-structure',
        'architecture/routing',
        'architecture/state-management',
      ],
    },
    
    {
      type: 'category',
      label: 'Features',
      collapsed: false,
      items: [
        'features/quiz-system',
        'features/feedback-system',
      ],
    },
    
    {
      type: 'category',
      label: 'Components',
      collapsed: false,
      items: [
        'components/sidetab',
        'components/skeleton',
        'components/pagination',
        'components/toast-notifications',
      ],
    },
    
    'api-integration',
    'authentication',
    'environment-config',
    'error-handling',
    'deployment',
    'coding-standards',
  ],
};

export default sidebars;
