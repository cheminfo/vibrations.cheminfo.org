/** A cited source, shown at the foot of a theory section. */
export interface TheoryReference {
  label: string;
  /** Where the source can be read, when it is online. @default undefined */
  url?: string;
}

/** One section of the background reading offered by the About / help panel. */
export interface TheorySection {
  id: string;
  title: string;
  /** Plain-text paragraphs, in reading order. */
  paragraphs: readonly string[];
  /** Further reading, where the section cites a source. @default undefined */
  references?: readonly TheoryReference[];
}

/**
 * The theoretical background the tool teaches.
 * Plain text throughout, with the notation carried as Unicode (3N−6, Δν, dμ/dx)
 * rather than as markup, so the panel needs no markdown or LaTeX renderer.
 */
export const THEORY_SECTIONS: readonly TheorySection[] = [
  {
    id: 'gross-selection-rule',
    title: 'Gross selection rule',
    paragraphs: [
      'A vibration appears in an infrared spectrum only if the dipole moment of the molecule changes as the atoms move. Expand the dipole μ(x) around the equilibrium geometry: the constant term μ₀ contributes nothing, because the harmonic-oscillator wave functions of two different levels are orthogonal, so the whole transition moment is carried by the derivative (dμ/dx) at the equilibrium geometry. Where that derivative vanishes the transition is forbidden and the mode is IR inactive.',
      'Raman spectroscopy obeys a different gross selection rule: there the polarizability must change with the displacement. The two conditions are independent, which is why a mode that is invisible in the infrared can be strong in the Raman spectrum, and the other way round.',
    ],
    references: [
      {
        label:
          'Malte Oppermann, lecture notes on electronic spectroscopy, EPFL (2015)',
      },
    ],
  },
  {
    id: 'specific-selection-rule',
    title: 'Specific selection rule',
    paragraphs: [
      'Evaluating the same transition moment in the harmonic approximation shows that only transitions between neighbouring vibrational levels are allowed, Δν = ±1. A harmonic calculation therefore predicts exactly one band per normal mode. Real bonds are not perfectly harmonic, so higher transitions — overtones and combination bands — become weakly allowed in a measured spectrum; they are much less intense than the fundamentals, and a harmonic calculation does not produce them at all.',
    ],
  },
  {
    id: 'mutual-exclusion',
    title: 'The rule of mutual exclusion',
    paragraphs: [
      'In a molecule that has a centre of inversion, every normal mode is either IR active or Raman active, never both. Carbon dioxide is the standard demonstration: its symmetric stretch leaves the dipole at zero and is Raman-only, while the bend and the asymmetric stretch change the dipole and are IR-only.',
      'Carbonyl sulfide has the same linear shape but no centre of inversion, and every one of its modes shows up in both spectra. Comparing the two is the quickest way to see that the rule is about symmetry, not about shape.',
    ],
    references: [
      {
        label: 'Rule of mutual exclusion',
        url: 'https://en.wikipedia.org/wiki/Rule_of_mutual_exclusion',
      },
    ],
  },
  {
    id: 'degrees-of-freedom',
    title: 'Degrees of freedom',
    paragraphs: [
      'A system of N atoms has 3N degrees of freedom. Three of them describe translation of the centre of mass along the three spatial directions. Three more describe rotation, which leaves the centre of mass fixed — but only two for a linear molecule, because rotation about the molecular axis moves nothing at all.',
      'What is left is vibration: 3N−6 modes for a non-linear molecule and 3N−5 for a linear one. Carbon dioxide and water, both three atoms, are the pair to compare: four vibrational modes for the linear one and three for the bent one.',
    ],
    references: [
      {
        label: 'Frank Neese, lecture on molecular vibrations and IR spectra',
        url: 'https://www.youtube.com/watch?v=iJjg2L1F8I4',
      },
    ],
  },
  {
    id: 'spectra-from-the-hessian',
    title: 'Spectra from the Hessian',
    paragraphs: [
      'Around a local minimum the potential energy is approximated by a Taylor expansion truncated after the second derivatives. Those second derivatives are the force constants f_ij and they form the Hessian matrix. Newton’s equations of motion then reduce to an eigenvalue problem.',
      'Its eigenvectors are the normal modes: within one mode every atom moves with the same frequency and the same phase, but with its own amplitude. Its eigenvalues are the squared vibrational frequencies, each one a force constant divided by the reduced mass of the atoms that move in that mode. A stiffer bond therefore means a higher frequency, and that is the whole bridge between an electronic effect on a bond and a shift in the spectrum; a heavier atom means a lower one, which is why deuteration moves a C–H stretch without touching the bond at all.',
      'In practice the geometry is relaxed to a minimum first, and the Hessian is then built by finite differences: displace each atom along each Cartesian direction, forwards and backwards, and difference the resulting gradients. The same displacement sweep yields the dipole derivatives, so the IR intensities cost nothing on top of the Hessian itself.',
    ],
    references: [
      {
        label: 'C. David Sherrill, lecture notes on molecular vibrations',
        url: 'https://vergil.chemistry.gatech.edu/courses/chem6485/pdf/vibrations.pdf',
      },
      {
        label:
          'Porezag & Pederson, IR intensities and Raman activities within DFT, Phys. Rev. B 54, 7830 (1996)',
        url: 'https://journals.aps.org/prb/abstract/10.1103/PhysRevB.54.7830',
      },
    ],
  },
  {
    id: 'method',
    title: 'Where the energies come from',
    paragraphs: [
      'The energies and gradients are computed with GFN2-xTB, a semi-empirical density-functional tight-binding method: the energy is expanded in density fluctuations around a superposition of atomic reference densities, and the integrals that are expensive to evaluate are replaced by empirical parameters. Those parameters are fitted per element rather than per element pair, which is what lets one parameter set cover a broad swath of chemistry.',
      'That approximation is why a full Hessian — a few hundred gradient evaluations — is affordable inside a browser tab, where a density-functional calculation of the same molecule would not be.',
    ],
    references: [
      {
        label:
          'Bannwarth, Ehlert & Grimme, GFN2-xTB, J. Chem. Theory Comput. (2019)',
        url: 'https://pubs.acs.org/doi/10.1021/acs.jctc.8b01176',
      },
    ],
  },
  {
    id: 'curated-collections',
    title: 'Reading the curated collections',
    paragraphs: [
      'The collections illustrate important effects in organic chemistry, all of them using the carbonyl stretching frequency as a probe. The one thing to keep in mind throughout: a stronger bond means a larger force constant, and a larger force constant means a higher wavenumber.',
    ],
  },
  {
    id: 'limitations',
    title: 'What the simulation does not include',
    paragraphs: [
      'The calculation treats one isolated molecule in the gas phase, in the harmonic approximation. Measured frequencies and intensities generally differ: hydrogen bonding, solvent, crystal packing and rotational fine structure are all absent, harmonic wavenumbers come out systematically too high, and no line broadening is applied.',
      'Intensities are the less reliable half of the prediction. The Theory vs. experiment collection exists to put these gaps in front of you rather than hide them.',
    ],
  },
];

/**
 * One short paragraph per collection, keyed by the collection id, explaining
 * the effect that collection is built to show.
 */
export const COLLECTION_THEORY: Readonly<Record<string, string>> = {
  'directing-groups':
    'A substituent on the ring reaches the carbonyl through the π system as well as through the σ framework. A methoxy group withdraws inductively but donates a lone pair by resonance, which enriches the ring and the carbonyl and lowers the stretch; a nitro group withdraws both ways and raises it. Because the resonance contribution depends on where the substituent sits, the ortho, meta and para isomers do not shift by the same amount — and in the ortho isomers the substituent is also close enough to interact with the carbonyl directly.',
  'inductive-mesomeric-effect':
    'The inductive effect is the change in electron density a group transmits through σ bonds: an electronegative group pulls density away and leaves the neighbouring atom more positive, which changes the bond strength and so the frequency. The mesomeric effect travels through π bonds instead, and is the one drawn with resonance structures. Fluorine and chlorine act almost purely inductively and push the carbonyl stretch well up. The ester oxygen and the amide nitrogen do both at once — they withdraw through the σ bond and donate a lone pair into the C=O π system — so the series turns on which contribution wins. For the ester the inductive withdrawal still has the upper hand and its band lies above the ketone; nitrogen is the much better π donor, its donation dominates, and the amide ends up the lowest of the series.',
  'mesomeric-effect':
    'Conjugating a C=C double bond with the carbonyl lets the π electrons delocalize over both bonds. The C=O bond order drops, its force constant drops with it, and the stretch moves to a lower wavenumber. Adding a second vinyl group on the other side of the same carbonyl repeats the effect.',
  'gross-selection-rule':
    'Symmetry decides how many of the 3N−6 (or 3N−5) modes can be seen. Nitrogen, a homonuclear diatomic, has one mode and no infrared spectrum at all. Carbon dioxide has a centre of inversion, so its symmetric stretch is Raman-only, while carbonyl sulfide — the same linear shape without the inversion centre — shows every mode. Methane has nine vibrational modes but only two distinct IR-active frequencies, because its tetrahedral symmetry makes them degenerate. Replace the four hydrogens with four different halogens and all symmetry is gone: all nine modes appear.',
  'ring-strain':
    'Ring strain means the atoms are forced into a geometry they do not like. In a small ring the carbonyl carbon is held far from its preferred sp² angles, and the C=O stretch cannot proceed without changing the ring bonds as well — visible directly in the animation, where the ring bond lengths move far more in cyclopropanone than in cyclooctanone. That extra resistance acts as a larger effective force constant, so the band sits at a higher wavenumber the smaller the ring.',
  'steric-effect':
    'Bulky substituents can force a molecule into a twisted or bent conformation. Where that twist breaks the coplanarity of a conjugated system, the π orbitals overlap less well, the mesomeric effect that was lowering the carbonyl stretch weakens, and the band moves back up. Geometry, not electronegativity, is doing the work.',
  'theory-vs-experiment':
    'The experimental band positions here come from the SDBS database, measured in a condensed phase. Benzamide and salicylic acid are hydrogen bonded there — between molecules through the N–H of the primary amide, inside the molecule for salicylic acid — and an isolated-molecule harmonic calculation has no way to know about it. N,N-dimethylbenzamide has no N–H and so cannot donate a hydrogen bond at all: its band is the lowest of the four because the nitrogen donates strongly into the C=O, an effect the calculation does capture, which is why it is the interesting counter-example rather than another hydrogen-bonding case. The ester is the mildest case and lands closest to its measured value.',
};
