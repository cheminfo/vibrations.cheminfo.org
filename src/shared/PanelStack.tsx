import { Button, NonIdealState } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactNode } from 'react';
import { Accordion } from 'react-science/ui';

import { ModesPanel } from '../pages/calculator/ModesPanel.tsx';
import { SeriesPanel } from '../pages/calculator/SeriesPanel.tsx';
import { SettingsPanel } from '../pages/calculator/SettingsPanel.tsx';
import { ThermochemistryPanel } from '../pages/calculator/ThermochemistryPanel.tsx';
import type { PanelId } from '../state/index.ts';
import { state, togglePanel } from '../state/index.ts';

import { ExperimentalPanel } from './ExperimentalPanel.tsx';
import { MoleculePanel } from './MoleculePanel.tsx';
import type { PanelDefinition } from './panels.ts';
import { panelsForPage } from './panels.ts';

/**
 * What each panel renders.
 *
 * A panel with no entry here shows a placeholder rather than disappearing, so
 * the shell and the panels can be built independently: adding a panel is one
 * import and one entry in this record.
 */
const PANEL_VIEWS: Partial<Record<PanelId, () => ReactNode>> = {
  molecule: () => <MoleculePanel />,
  settings: () => <SettingsPanel />,
  series: () => <SeriesPanel />,
  modes: () => <ModesPanel />,
  thermochemistry: () => <ThermochemistryPanel />,
  experimental: () => <ExperimentalPanel />,
};

/**
 * The open side panels of the active page, stacked in one accordion so they
 * share the height.
 *
 * A panel header carries the close button and nothing else; every action a panel
 * offers belongs in a toolbar inside its body.
 */
export function PanelStack() {
  useSignals();
  const openPanels = state.view.openPanels.value;
  const page = state.view.page.value;

  return (
    <>
      {panelsForPage(page)
        .filter((panel) => openPanels.has(panel.id))
        .map((panel) => (
          <Accordion.Item
            key={panel.id}
            id={panel.id}
            title={panel.title}
            defaultOpen
            renderToolbar={() => (
              <Button
                variant="minimal"
                icon="cross"
                aria-label={`Close ${panel.title}`}
                onClick={() => togglePanel(panel.id)}
              />
            )}
          >
            <PanelBody panel={panel} />
          </Accordion.Item>
        ))}
    </>
  );
}

function PanelBody(props: { panel: PanelDefinition }) {
  const { panel } = props;
  const render = PANEL_VIEWS[panel.id];
  if (render !== undefined) return render();
  return (
    <NonIdealState
      icon={panel.icon}
      title={panel.title}
      description="This panel is not built yet."
    />
  );
}
