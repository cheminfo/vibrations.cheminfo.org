import { NonIdealState } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { NavItem } from 'react-cheminfo/ui';
import { NavLink, SiteHeader, SiteTheme } from 'react-cheminfo/ui';
import {
  Accordion,
  AccordionProvider,
  ActivityBar,
  RootLayout,
  SplitPane,
} from 'react-science/ui';

import { CalculatorPage } from './pages/calculator/CalculatorPage.tsx';
import { CollectionsPage } from './pages/collections/CollectionsPage.tsx';
import { ValidationPage } from './pages/validation/ValidationPage.tsx';
import { AboutDialog } from './shared/AboutDialog.tsx';
import { AppLogo } from './shared/AppLogo.tsx';
import { PanelStack } from './shared/PanelStack.tsx';
import { StatusBar } from './shared/StatusBar.tsx';
import { panelsForPage } from './shared/panels.ts';
import { SITE } from './site.ts';
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
 * The application shell: the site's bar with its pages and About on top, then
 * the active page over the status bar, with the side panels on the right. The
 * bar carries no Tools menu: the site is not one of the cheminfo family.
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

  const nav: NavItem[] = PAGE_ITEMS.map((item) => ({
    id: item.id,
    label: item.title,
    href: `#/${item.id}`,
    onSelect: () => setPage(item.id),
  }));

  return (
    <div className="app">
      <SiteTheme site={SITE} />
      <SiteHeader
        site={SITE}
        mark={<AppLogo size={26} />}
        width="full"
        nav={nav}
        activeId={page}
        homeHref="#/calculator"
        onHome={() => setPage('calculator')}
        actions={
          <NavLink
            item={{
              id: 'about',
              label: 'About',
              icon: <AppLogo size={14} />,
              title: `What ${SITE.host} is, and what it is built on`,
              onSelect: () => (state.view.aboutOpen.value = true),
            }}
          />
        }
      />
      <main className="app-body">
        <RootLayout style={{ height: '100%' }}>
          <div style={rootStyle}>
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
      </main>
    </div>
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
