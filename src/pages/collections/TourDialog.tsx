import {
  Button,
  Callout,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  Tag,
} from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';

import type { TourSection } from '../../data/index.ts';
import { TOUR_STEPS } from '../../data/index.ts';
import { closeTour, setTourStep, view } from '../../state/index.ts';

/**
 * Where each part the tour talks about is found in the interface.
 *
 * Written out rather than drawn: a screenshot goes stale the first time a panel
 * moves, and a sentence names the panel the reader has to open.
 */
const WHERE_TO_FIND: Readonly<Record<TourSection, string>> = {
  introduction: 'You are reading it.',
  'structure-editor': 'Calculator page, Molecule panel.',
  collections: 'This page — the list on the left.',
  'molecule-table': 'Spectra panel, on the right of this page.',
  spectrum: 'Calculator page, the chart in the middle.',
  'mode-table': 'Vibrational modes panel, on the right.',
  'structure-view': 'Molecule panel, the 2D drawing under the viewer.',
  help: 'The application logo, first item of the toolbar on the far left.',
};

/**
 * The eight-step guided tour of the application.
 * @returns The dialog, open only while the tour is running.
 */
export function TourDialog() {
  useSignals();
  const open = view.tourOpen.value;
  const index = view.tourStep.value;
  const step = TOUR_STEPS[index];
  if (step === undefined) return null;

  return (
    <Dialog
      isOpen={open}
      onClose={closeTour}
      title={step.title}
      icon="help"
      style={{ width: 620 }}
    >
      <DialogBody>
        <Tag minimal round style={{ marginBottom: 8 }}>
          Step {index + 1} of {TOUR_STEPS.length}
        </Tag>
        {step.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <Callout
          intent="primary"
          compact
          icon="locate"
          title="Where to find it"
        >
          <span className={Classes.TEXT_MUTED}>
            {WHERE_TO_FIND[step.section]}
          </span>
        </Callout>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button
              icon="chevron-left"
              text="Previous"
              disabled={index === 0}
              onClick={() => setTourStep(index - 1)}
            />
            {index === TOUR_STEPS.length - 1 ? (
              <Button intent="primary" text="Done" onClick={closeTour} />
            ) : (
              <Button
                intent="primary"
                endIcon="chevron-right"
                text="Next"
                onClick={() => setTourStep(index + 1)}
              />
            )}
          </>
        }
      />
    </Dialog>
  );
}
