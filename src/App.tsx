import { NonIdealState } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
  Accordion,
  AccordionProvider,
  ActivityBar,
  RootLayout,
  SplitPane,
  Toolbar,
} from 'react-science/ui';

import { CalculatorPage } from './pages/calculator/CalculatorPage.tsx';
import { CollectionsPage } from './pages/collections/CollectionsPage.tsx';
import { ValidationPage } from './pages/validation/ValidationPage.tsx';
import { AboutDialog } from './shared/AboutDialog.tsx';
import { AppLogo } from './shared/AppLogo.tsx';
import { PanelStack } from './shared/PanelStack.tsx';
import { StatusBar } from './shared/StatusBar.tsx';
import { panelsForPage } from './shared/panels.ts';
import type { PageId } from './state/index.ts';
import { applyHash, setPage, state, togglePanel } from './state/index.ts';

interface PageItem {
  id: PageId;
  title: string;
  icon: IconName;
}

const PAGE_ITEMS: readonly PageItem[] = [
  { id: 'calculator', title: 'Calculator', icon: 'lab-test' },
  { id: 'collections', title: 'Collections', icon: 'grid-view' },
  { id: 'validation', title: 'Validation', icon: 'confirm' },
];

/**
 * What each page renders.
 *
 * A page with no entry here shows a placeholder rather than a blank screen, so
 * the shell and the pages can be built independently: adding a page view is one
 * import and one entry in this record.
 */
const PAGE_VIEWS: Partial<Record<PageId, () => ReactNode>> = {
  calculator: () => <CalculatorPage />,
  collections: () => <CollectionsPage />,
  validation: () => <ValidationPage />,
};

/**
 * The application shell: the page toolbar on the left, the active page in the
 * middle over the status bar, and the side panels on the right.
 */
export function App() {
  useSignals();
  const page = state.view.page.value;
  const openPanels = state.view.openPanels.value;
  const panels = panelsForPage(page);
  const openHere = panels.filter((panel) => openPanels.has(panel.id));

  useEffect(() => {
    applyHash();
    globalThis.addEventListener('hashchange', applyHash);
    return () => globalThis.removeEventListener('hashchange', applyHash);
  }, []);

  return (
    <RootLayout style={{ height: '100%' }}>
      <div style={rootStyle}>
        <Toolbar vertical aria-label="Application">
          <Toolbar.Item
            icon={<AppLogo size={16} />}
            tooltip="About Vibrations"
            aria-label="About Vibrations"
            onClick={() => (state.view.aboutOpen.value = true)}
          />
          {PAGE_ITEMS.map((item) => (
            <Toolbar.Item
              key={item.id}
              icon={item.icon}
              tooltip={item.title}
              aria-label={item.title}
              active={page === item.id}
              onClick={() => setPage(item.id)}
            />
          ))}
        </Toolbar>

        <SplitPane
          direction="horizontal"
          controlledSide="end"
          defaultSize="400px"
          open={openHere.length > 0}
          onOpenChange={(open) => {
            if (open) {
              const first = panels[0];
              if (first !== undefined) togglePanel(first.id);
            } else {
              for (const panel of openHere) togglePanel(panel.id);
            }
          }}
        >
          <div style={mainStyle}>
            <div style={viewStyle}>
              <PageView page={page} />
            </div>
            <StatusBar />
          </div>

          <AccordionProvider>
            <Accordion>
              <PanelStack />
            </Accordion>
          </AccordionProvider>
        </SplitPane>

        <ActivityBar>
          {panels.map((panel) => (
            <ActivityBar.Item
              key={panel.id}
              icon={panel.icon}
              tooltip={panel.title}
              // A tooltip is not an accessible name: without this the six panel
              // toggles are icon-only buttons with no text at all.
              aria-label={panel.title}
              active={openPanels.has(panel.id)}
              onClick={() => togglePanel(panel.id)}
            />
          ))}
        </ActivityBar>
      </div>

      <AboutDialog
        isOpen={state.view.aboutOpen.value}
        onClose={() => (state.view.aboutOpen.value = false)}
      />
    </RootLayout>
  );
}

function PageView(props: { page: PageId }) {
  const { page } = props;
  const render = PAGE_VIEWS[page];
  if (render !== undefined) return render();
  const item = PAGE_ITEMS.find((candidate) => candidate.id === page);
  return (
    <NonIdealState
      icon={item?.icon ?? 'lab-test'}
      title={item?.title ?? page}
      description="This page is not built yet."
    />
  );
}

const rootStyle = { display: 'flex', height: '100%', minHeight: 0 } as const;
const mainStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 1px',
  minWidth: 0,
  minHeight: 0,
} as const;
const viewStyle = { flex: '1 1 1px', minHeight: 0, display: 'flex' } as const;
