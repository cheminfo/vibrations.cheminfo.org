import {
  AnchorButton,
  Classes,
  Dialog,
  DialogBody,
  DialogFooter,
  Tab,
  Tabs,
} from '@blueprintjs/core';

import { THEORY_SECTIONS } from '../data/index.ts';

import { AppLogo } from './AppLogo.tsx';

/** One borrowed work, with what it does here and the terms it comes under. */
interface Credit {
  name: string;
  role: string;
  licence: string;
  /** @default undefined */
  url?: string;
}

const CREDITS: readonly Credit[] = [
  {
    name: 'xtb-wasm — cheminfo',
    role: 'The calculation library this application is built on: the browser engine and its worker pool, the normal-mode, Raman and thermochemistry analysis, the structure readers, and the ten native-xtb calculations the Validation page checks against.',
    licence: 'GPL-3.0',
    url: 'https://github.com/cheminfo/xtb-wasm',
  },
  {
    name: 'OCC — Peter Spackman',
    role: 'An independent C++ implementation of GFN2-xTB, compiled to WebAssembly and published as @peterspackman/occjs. It is what runs in your browser: the optimization, the Hessian and the dipole derivatives.',
    licence: 'GPL-3.0',
    url: 'https://github.com/peterspackman/occ',
  },
  {
    name: 'xtb — Grimme group, University of Bonn',
    role: 'The reference implementation of GFN2-xTB, the source of the validation fixtures, and the origin of the modified rigid-rotor/harmonic-oscillator treatment of low-lying modes used for the thermochemistry. Cite WIREs Comput. Mol. Sci. 2021, 11, e1493.',
    licence: 'LGPL-3.0',
    url: 'https://github.com/grimme-lab/xtb',
  },
  {
    name: 'ASE — Atomic Simulation Environment',
    role: 'The bond-polarizability (Lippincott–Stutman) Raman model, transcribed from ase.vibrations.placzek and its parameter tables.',
    licence: 'LGPL-2.1',
    url: 'https://wiki.fysik.dtu.dk/ase/',
  },
  {
    name: 'xtbservice — cheminfo',
    role: 'The curated teaching collections, the guided tour and its pedagogic text, the overlay palette and the bond-to-mode mapping.',
    licence: 'MIT',
    url: 'https://github.com/cheminfo-py/xtbservice',
  },
  {
    name: 'Mol* — Sehnal et al.',
    role: 'The 3D viewer and the normal-mode animation.',
    licence: 'MIT',
    url: 'https://molstar.org/',
  },
  {
    name: 'OpenChemLib',
    role: 'Structure handling: the drawing editor, the depiction, the conformer used as a starting geometry, and the molecular formulas.',
    licence: 'BSD-3-Clause',
    url: 'https://github.com/cheminfo/openchemlib-js',
  },
  {
    name: 'react-science, react-cheminfo, react-plot, react-mf, react-ocl',
    role: 'The interface: the application shell, the colour-blind-safe chart palette, the spectrum plot, the formula renderer and the structure components.',
    licence: 'MIT',
    url: 'https://github.com/zakodium-oss/react-science',
  },
  {
    name: 'spectrum-generator, ml-spectra-processing, ir-spectrum, raman-spectrum, spc-parser, sdf-parser',
    role: 'Band broadening, spectrum arithmetic and the readers for the experimental files you can drop on the chart.',
    licence: 'MIT',
    url: 'https://github.com/mljs/spectra-processing',
  },
  {
    name: 'BlueprintJS — Palantir',
    role: 'The widget set the interface is built from.',
    licence: 'Apache-2.0',
    url: 'https://blueprintjs.com/',
  },
];

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * What the application is, what it borrows, and the background reading. It is
 * the first item of the toolbar because the credits are a condition of use, not
 * an afterthought.
 * @param props - Component props.
 * @param props.isOpen - Whether the dialog is visible.
 * @param props.onClose - Called when the user dismisses it.
 */
export function AboutDialog(props: AboutDialogProps) {
  const { isOpen, onClose } = props;
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="About Vibrations"
      icon={<AppLogo size={20} />}
      style={{ width: 720 }}
    >
      {/* Prose, credits and literature references: a reader quotes them. */}
      <DialogBody className="text-selectable">
        <Tabs id="about" defaultSelectedTabId="about" renderActiveTabPanelOnly>
          <Tab id="about" title="About" panel={<AboutPanel />} />
          <Tab id="credits" title="Credits" panel={<CreditsPanel />} />
          <Tab id="background" title="Background" panel={<BackgroundPanel />} />
        </Tabs>
      </DialogBody>
      <DialogFooter
        actions={
          <AnchorButton
            href="https://github.com/cheminfo/vibrations.cheminfo.org"
            target="_blank"
            rel="noreferrer"
            text="Source on GitHub"
            icon="git-repo"
          />
        }
      />
    </Dialog>
  );
}

function AboutPanel() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <AppLogo size={64} />
      <div>
        <p>
          Predicts GFN2-xTB infrared and Raman spectra{' '}
          <b>entirely in your browser</b> — geometry optimization, Hessian,
          normal modes, intensities and thermochemistry included. Nothing is
          uploaded and no server does the work.
        </p>
        <p>
          The Raman activities come from the bond-polarizability model:
          empirical and purely geometric, so absolute intensities are typically
          tens of percent out and cumulated and triple bonds are qualitatively
          wrong. Every geometry, frequency and intensity describes one isolated
          molecule in the gas phase, so a band measured in solution or in the
          solid state can sit tens of cm⁻¹ away.
        </p>
        <p className={Classes.TEXT_MUTED} style={{ marginBottom: 0 }}>
          The browser engine is GPL-3.0 (OCC), and this application is
          distributed under the same terms.
        </p>
      </div>
    </div>
  );
}

function CreditsPanel() {
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {CREDITS.map((credit) => (
        <li key={credit.name} style={{ marginBottom: 10 }}>
          <b>{credit.name}</b> — {credit.role}{' '}
          <span className={Classes.TEXT_MUTED}>{credit.licence}</span>
          {credit.url !== undefined && (
            <>
              {' · '}
              <a href={credit.url} target="_blank" rel="noreferrer">
                site
              </a>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function BackgroundPanel() {
  return (
    <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
      {THEORY_SECTIONS.map((section) => (
        <section key={section.id}>
          <h4 style={{ marginBottom: 4 }}>{section.title}</h4>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
          {section.references !== undefined && (
            <p className={Classes.TEXT_MUTED}>
              {section.references.map((reference) => (
                <span key={reference.label} style={{ marginRight: 10 }}>
                  {reference.url === undefined ? (
                    reference.label
                  ) : (
                    <a href={reference.url} target="_blank" rel="noreferrer">
                      {reference.label}
                    </a>
                  )}
                </span>
              ))}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
