import { Callout, Classes, HTMLTable, Tag } from '@blueprintjs/core';

import type { CheckStatus, FixtureCheck } from './checkTypes.ts';

interface ValidationChecksProps {
  /** Name of the fixture these assertions belong to. */
  label: string;
  /** The assertions, in display order; empty before the fixture has been run. */
  checks: readonly FixtureCheck[];
}

/**
 * Every assertion made about one fixture, with the deviation actually measured
 * next to the tolerance it was judged against and the reason that tolerance is
 * the right one.
 * @param props - Component props.
 * @param props.label - Name of the fixture.
 * @param props.checks - The assertions to show.
 */
export function ValidationChecks(props: ValidationChecksProps) {
  const { label, checks } = props;

  if (checks.length === 0) {
    return (
      <Callout compact icon="info-sign">
        Run <b>{label}</b> to see the individual assertions: mode counts, band
        positions, IR intensities in both intensity regimes, and the mRRHO
        zero-point energy, enthalpy and free energy.
      </Callout>
    );
  }

  return (
    <HTMLTable compact style={{ width: '100%' }}>
      <thead>
        <tr>
          <th>Assertion</th>
          <th>Measured</th>
          <th>Tolerance</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {checks.map((check) => (
          <tr key={check.id}>
            <td>{check.label}</td>
            <td>
              <code>{check.actual}</code>
            </td>
            <td className={Classes.TEXT_MUTED}>
              {check.tolerance === null ? '—' : <code>{check.tolerance}</code>}
            </td>
            <td>
              <Tag minimal intent={CHECK_INTENT[check.status]}>
                {CHECK_LABEL[check.status]}
              </Tag>
              {check.note !== null && (
                <div className={`${Classes.TEXT_SMALL} ${Classes.TEXT_MUTED}`}>
                  {check.note}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  );
}

/** Semantic colour of each outcome; an informational row stays primary. */
const CHECK_INTENT: Record<CheckStatus, 'primary' | 'success' | 'danger'> = {
  pass: 'success',
  fail: 'danger',
  info: 'primary',
};

const CHECK_LABEL: Record<CheckStatus, string> = {
  pass: 'within tolerance',
  fail: 'out of tolerance',
  info: 'reported',
};
