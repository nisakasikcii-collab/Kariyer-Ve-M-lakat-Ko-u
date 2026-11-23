import test from 'node:test';
import assert from 'node:assert/strict';
import { extractGroundingSources } from './grounding';

test('extractGroundingSources deduplicates, strips www, and filters invalid URLs', () => {
  const sources = extractGroundingSources([
    { web: { uri: 'https://www.coursera.org/learn/react-basics', title: 'React Basics - Coursera' } },
    { web: { uri: 'https://www.coursera.org/learn/react-basics', title: 'Duplicate' } },
    { web: { uri: 'javascript:alert(1)', title: 'Bad URL' } },
    { web: { uri: 'not-a-url', title: 'Broken' } },
    { web: { uri: 'https://btkakademi.gov.tr/portal', title: '' } },
  ]);

  assert.equal(sources.length, 2);
  assert.equal(sources[0].domain, 'coursera.org');
  assert.equal(sources[0].title, 'React Basics - Coursera');
  assert.equal(sources[1].domain, 'btkakademi.gov.tr');
  assert.equal(sources[1].title, 'btkakademi.gov.tr');
});

test('extractGroundingSources respects maxItems and handles empty inputs', () => {
  assert.deepEqual(extractGroundingSources(undefined), []);
  assert.deepEqual(extractGroundingSources([]), []);

  const many = Array.from({ length: 10 }, (_, i) => ({
    web: { uri: `https://example.com/item-${i}`, title: `Item ${i}` },
  }));
  assert.equal(extractGroundingSources(many, 4).length, 4);
});
