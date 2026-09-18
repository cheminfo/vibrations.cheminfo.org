/** Which part of the interface a tour step is about. */
export type TourSection =
  | 'introduction'
  | 'structure-editor'
  | 'collections'
  | 'molecule-table'
  | 'spectrum'
  | 'mode-table'
  | 'structure-view'
  | 'help';

/** One step of the guided tour. */
export interface TourStep {
  id: string;
  title: string;
  /** The part of the interface this step points at. */
  section: TourSection;
  /** Plain-text paragraphs, in reading order. */
  paragraphs: readonly string[];
}

/**
 * The eight guided-tour steps, in reading order. Each one names the part of the
 * interface it talks about in `section`, which is what the dialog turns into a
 * pointer to the panel that holds it.
 */
export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'introduction',
    title: "Let's make molecules vibrate",
    section: 'introduction',
    paragraphs: [
      'This tool predicts IR spectra using semi-empirical quantum chemistry. But not only that. It also animates the vibrations and links them to the structure in an interactive way. Additionally, we provide collections that illustrate important electronic effects, such as the inductive and mesomeric effect.',
    ],
  },
  {
    id: 'adding-a-structure',
    title: 'Adding a structure',
    section: 'structure-editor',
    paragraphs: [
      'To get started, you can draw a structure using the structure editor. If you already have a structural drawing, you can copy it as SMILES or as a molfile and paste it into the editor.',
      "Once you're done with drawing, submit the simulation by clicking on the Predict button.",
      'The prediction might take a few seconds, but after it you will see the spectrum and a table with all modes.',
    ],
  },
  {
    id: 'loading-a-set',
    title: 'Loading a set',
    section: 'collections',
    paragraphs: [
      'If you have no particular molecule in mind — or want to explore some electronic effects — you can load curated sets of molecules by clicking on this button. It will open a menu in which the available sets are described, and you can select the one that interests you most. All structures from the set you selected will be simulated and appear in the graph.',
    ],
  },
  {
    id: 'toggling-between-molecules',
    title: 'Toggling between molecules',
    section: 'molecule-table',
    paragraphs: [
      'To see trends you need to compare spectra of multiple molecules. This table collects all molecules for which you submitted a simulation. By selecting a row you choose which molecule’s modes are loaded and for which molecule the animations are shown. If you no longer like a molecule you can delete it.',
    ],
  },
  {
    id: 'interacting-with-the-spectrum',
    title: 'Interacting with the spectrum',
    section: 'spectrum',
    paragraphs: [
      'In the spectrum you can zoom into a region with click and drag, and if you click on a band it will open the corresponding mode.',
    ],
  },
  {
    id: 'selecting-modes',
    title: 'Selecting modes',
    section: 'mode-table',
    paragraphs: [
      'In this table you will find all vibrational modes of the molecule — 3N−6 of them, or 3N−5 if the molecule is linear. If you hover over a row, the most relevant atoms for this mode will be highlighted. By clicking on a row, you can change the mode that is animated.',
    ],
  },
  {
    id: 'bond-to-band',
    title: 'Where do I see this bond in the spectrum?',
    section: 'structure-view',
    paragraphs: [
      'This window shows the 2D drawing of your molecule. In contrast to the editor, this drawing is coupled to the table and the animation.',
      'By clicking on a bond, for example, you can bring up the most relevant mode for this bond in the animation, the table and the spectrum.',
    ],
  },
  {
    id: 'help',
    title: 'Help! That was too much information!',
    section: 'help',
    paragraphs: [
      'If you want to look up certain functionalities, or learn a bit about the theoretical background, you can open the help menu.',
    ],
  },
];
