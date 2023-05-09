import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';
import GenerateImg from '@site/static/img/generate.png';

const FeatureList = [
  {
    title: 'Powered by Couchbase',
    Svg: require('@site/static/img/logo.svg').default,
    description: (
      <>
        Couchbase is JSON database that excels in high volume transactions, making Ottoman a powerful tool to handle
        your data.
      </>
    ),
  },
  {
    title: 'Fast',
    Svg: require('@site/static/img/fast.svg').default,
    description: (
      <>
        As Couchbase has a built-in managed cache to enable a memory-first architecture. Read and write operations run
        at the speed of RAM.
      </>
    ),
  },
  {
    title: 'Familiar',
    Svg: require('@site/static/img/familiar.svg').default,
    description: <>Ottoman brings together the best of NoSQL document databases and relational databases.</>,
  },
];

function Feature({ Svg, title, description }) {
  return (
    <>
      <div className={clsx('col col--4')}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </>
  );
}

export default function HomepageFeatures() {
  return (
    <>
      <div className="container">
        <div className="row" style={{ marginTop: 16 }}>
          <div className="text--center" style={{ width: '100%' }}>
            <h3>
              Spin up your project in a few steps using the <Link to="docs/cli">CLI</Link>
            </h3>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <pre>
            <code>$ npx ottoman-cli generate</code>
          </pre>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <img src={GenerateImg} />
        </div>
      </div>
      <section className={styles.features}>
        <div className="container">
          <div className="row">
            {FeatureList.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
