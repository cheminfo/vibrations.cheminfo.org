import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { UnitTable } from '../UnitTable.tsx';

const ROWS = [
  {
    label: 'Zero-point energy',
    description: 'Half a quantum in every genuine vibration.',
    values: ['0.051234', '32.15'],
  },
  {
    label: 'Total free energy',
    description: 'What a reaction energy is built from.',
    values: ['-5.123456'],
  },
];

function markup() {
  return renderToStaticMarkup(
    <UnitTable caption="Energy" units={['Eh', 'kcal/mol']} rows={ROWS} />,
  );
}

test('every thermochemistry value is a copyable cell naming its unit', () => {
  const html = markup();
  expect(html).toContain('title="Copy the Zero-point energy in Eh (0.051234)"');
  expect(html).toContain(
    'title="Copy the Zero-point energy in kcal/mol (32.15)"',
  );
  expect(html).toContain(
    'title="Copy the Total free energy in Eh (-5.123456)"',
  );
});

test('the copy target is the cell itself, so the table stays a table', () => {
  const cells = markup().match(/<td class="click-to-copy[^"]*"/g) ?? [];
  expect(cells).toHaveLength(3);
  for (const cell of cells) {
    expect(cell).toContain('click-to-copy--block');
  }
});

test('a cell with no value in that unit is drawn plain', () => {
  const html = markup();
  const plain = html.match(/<td style="[^"]*"><\/td>/g) ?? [];
  expect(plain).toHaveLength(1);
  expect(html).not.toContain('title="Copy the Total free energy in kcal/mol"');
});
