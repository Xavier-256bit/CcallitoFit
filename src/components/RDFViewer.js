import React, { useEffect, useState } from 'react';
import * as rdf from 'rdflib';
import styles from './RDFViewer.module.css';

const RDFViewer = () => {
  const [groupedData, setGroupedData] = useState(null);
  const [rawRDF, setRawRDF] = useState(null);

  useEffect(() => {
    const filePath = '/data.rdf';

    fetch(filePath)
      .then((response) => response.text())
      .then((xmlString) => {
        setRawRDF(xmlString);
        const store = rdf.graph();
        const mimeType = 'application/rdf+xml';
        rdf.parse(xmlString, store, 'http://example.org', mimeType);

        const statements = store.statementsMatching();
        const grouped = {};
        statements.forEach((stmt) => {
          const subject = stmt.subject.value;
          if (subject.startsWith('http://ccallitofit.com')) {
            grouped[subject] = grouped[subject] || [];
            grouped[subject].push(stmt);
          }
        });

        setGroupedData(grouped);
      })
      .catch((error) => console.error('Error loading RDF:', error));
  }, []);

  const isURL = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const renderValue = (value) =>
    isURL(value) ? (
      <a href={value} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {value}
      </a>
    ) : (
      value
    );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>RDF Viewer</h1>
      {groupedData ? (
        Object.keys(groupedData).map((about, index) => (
          <div key={index}>
            <h2 className={styles.subtitle}>{about}</h2>
            <ul className={styles.list}>
              {groupedData[about].map((stmt, idx) => (
                <li key={idx} className={styles.item}>
                  <strong>Predicate:</strong> {renderValue(stmt.predicate.value)} <br />
                  <strong>Object:</strong> {renderValue(stmt.object.value)}
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Loading RDF data...</p>
      )}
      {rawRDF && (
        <div>
          <h1 className={styles.title}>RDF Code</h1>
          <pre className={styles.rawCode}>{rawRDF}</pre>
        </div>
      )}
    </div>
  );
};

export default RDFViewer;



