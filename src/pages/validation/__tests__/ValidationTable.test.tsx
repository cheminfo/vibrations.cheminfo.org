import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ValidationRow } from '../../../state/index.ts';
import { ValidationTable } from '../ValidationTable.tsx';

const FAILED: ValidationRow = {
  fixtureId: 'water',
  label: 'water',
  atoms: 3,
  status: 'fail',
  maxFrequencyDelta: 12.5,
  energyDelta: 1.2e-7,
  cosineSimilarity: 0.9987,
  durationMs: 4200,
  message: 'max |Δν| 12.5 cm⁻¹ is above the 5 cm⁻¹ tolerance',
};

function markup(row: ValidationRow) {
  return renderToStaticMarkup(
    <ValidationTable
      rows={[row]}
      selectedId={null}
      onSelect={() => undefined}
      onRun={() => undefined}
      busy={false}
    />,
  );
}

test('the reason a fixture failed is taken away with one click', () => {
  const html = markup(FAILED);
  expect(html).toContain(
    'title="Copy the message (max |Δν| 12.5 cm⁻¹ is above the 5 cm⁻¹ tolerance)"',
  );
  expect(html).toContain('click-to-copy--block');
});

test('a row with nothing to report carries no copy target', () => {
  const html = markup({ ...FAILED, status: 'pending', message: null });
  expect(html).not.toContain('click-to-copy');
});
