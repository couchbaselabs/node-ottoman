import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

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
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
