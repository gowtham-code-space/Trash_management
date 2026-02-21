import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/introduction">
            Get Started →
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/architecture/overview"
            style={{marginLeft: '1rem'}}>
            Architecture
          </Link>
        </div>
      </div>
    </header>
  );
}

function ProjectOverview() {
  return (
    <section style={{padding: '4rem 0', background: 'var(--ifm-background-surface-color)'}}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <Heading as="h2" style={{textAlign: 'center', marginBottom: '2rem'}}>
              Project Overview
            </Heading>
            <p style={{fontSize: '1.2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8'}}>
              A comprehensive role-based web application designed to digitize and streamline municipal waste management operations. 
              The system facilitates coordination between residents, waste collection workers, supervisors, sanitary inspectors, 
              municipal health officers, and commissioners.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechnologyStack() {
  const technologies = [
    {name: 'React 19.2', category: 'UI Library'},
    {name: 'Vite 7.2', category: 'Build Tool'},
    {name: 'React Router 7', category: 'Routing'},
    {name: 'Tailwind CSS 4', category: 'Styling'},
    {name: 'Zustand 5', category: 'State Management'},
    {name: 'Axios', category: 'HTTP Client'},
    {name: 'React Leaflet', category: 'Maps'},
    {name: 'Recharts', category: 'Data Visualization'},
  ];

  return (
    <section style={{padding: '4rem 0'}}>
      <div className="container">
        <Heading as="h2" style={{textAlign: 'center', marginBottom: '2rem'}}>
          Technology Stack
        </Heading>
        <div className="row">
          {technologies.map((tech, idx) => (
            <div key={idx} className="col col--3" style={{marginBottom: '1.5rem'}}>
              <div style={{
                padding: '1.5rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '8px',
                textAlign: 'center',
                height: '100%'
              }}>
                <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>{tech.name}</h3>
                <p style={{fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-700)', margin: 0}}>
                  {tech.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function KeyFeatures() {
  const features = [
    {
      title: 'Role-Based Access Control',
      description: '6 distinct user roles with tailored interfaces and permissions',
    },
    {
      title: 'Real-Time Tracking',
      description: 'Live location tracking and map visualization for waste collection routes',
    },
    {
      title: 'Feedback System',
      description: 'QR code and OTP-based feedback collection mechanism',
    },
    {
      title: 'Task Management',
      description: 'Hierarchical task assignment and monitoring workflows',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive statistics and performance metrics visualization',
    },
    {
      title: 'OTP Authentication',
      description: 'Secure email/SMS-based authentication with token refresh',
    },
  ];

  return (
    <section style={{padding: '4rem 0', background: 'var(--ifm-background-surface-color)'}}>
      <div className="container">
        <Heading as="h2" style={{textAlign: 'center', marginBottom: '2rem'}}>
          Key Features
        </Heading>
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className="col col--4" style={{marginBottom: '2rem'}}>
              <div style={{padding: '1.5rem'}}>
                <h3 style={{fontSize: '1.2rem', marginBottom: '0.75rem'}}>{feature.title}</h3>
                <p style={{color: 'var(--ifm-color-emphasis-700)'}}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  const links = [
    {title: 'Introduction', url: '/docs/introduction', description: 'Project overview and system boundaries'},
    {title: 'Architecture', url: '/docs/architecture/overview', description: 'System design and data flow patterns'},
    {title: 'Features', url: '/docs/features/quiz-system', description: 'Detailed feature documentation'},
    {title: 'API Integration', url: '/docs/api-integration', description: 'Backend communication patterns'},
    {title: 'Deployment', url: '/docs/deployment', description: 'Production deployment guide'},
    {title: 'Coding Standards', url: '/docs/coding-standards', description: 'Code conventions and best practices'},
  ];

  return (
    <section style={{padding: '4rem 0'}}>
      <div className="container">
        <Heading as="h2" style={{textAlign: 'center', marginBottom: '2rem'}}>
          Documentation Sections
        </Heading>
        <div className="row">
          {links.map((link, idx) => (
            <div key={idx} className="col col--4" style={{marginBottom: '1.5rem'}}>
              <Link 
                to={link.url}
                style={{
                  display: 'block',
                  padding: '1.5rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                className="quicklink-card"
              >
                <h3 style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>{link.title}</h3>
                <p style={{fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-700)', margin: 0}}>
                  {link.description}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Frontend Documentation"
      description="Comprehensive technical documentation for the Trash Management System frontend application">
      <HomepageHeader />
      <main>
        <ProjectOverview />
        <TechnologyStack />
        <KeyFeatures />
        <QuickLinks />
      </main>
    </Layout>
  );
}
