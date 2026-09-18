# vibrations.cheminfo.org

Predict and explore the infrared and Raman spectra of a molecule **entirely in
your browser**. Draw or paste a structure, and a GFN2-xTB geometry
optimization, Hessian, normal modes, intensities and thermochemistry run on
your own machine — nothing is uploaded and no server does the work.

The chemistry runs on [`xtb-wasm`](https://github.com/cheminfo/xtb-wasm), which
packages an independent C++ implementation of GFN2-xTB
([OCC](https://github.com/peterspackman/occ)) as WebAssembly and drives it from
a pool of web workers.

## The three pages

- **Calculator** — draw, paste or load a structure, run it, and read the
  spectrum against the mode table. Clicking a band animates the mode in 3D;
  clicking a bond selects the mode that stretches it most. Experimental files
  can be dropped on the chart and overlaid on the prediction.
- **Collections** — seven curated sets of molecules, each holding everything
  but one structural variable fixed so a single effect on the carbonyl stretch
  (or on the number of bands) becomes visible. A guided tour walks through
  them.
- **Validation** — the ten native-`xtb` reference calculations the engine is
  checked against, recomputed in the browser and compared band by band,
  with the thermochemistry and the spectral agreement scored.

## Running it locally

```sh
npm install
npm run dev
```

The dev server listens on <http://localhost:10919> with `strictPort`, so a
second checkout fails loudly instead of landing on a port the proxy and this
file do not agree with.

`npm run test` runs the unit tests with coverage, the type check, the colour
token and deployment contract checks, ESLint and Prettier. `npm run build`
writes the static site to `dist/`.

## Deployment

The site ships as a static image served by `static-web-server`, in three
modes. Copy the template, pick one mode, and bring it up:

```sh
cp .env.example .env
# uncomment exactly ONE COMPOSE_FILE line in .env
docker compose up -d
```

| `COMPOSE_FILE`             | How the site is reached                                      |
| -------------------------- | ------------------------------------------------------------ |
| unset, or `compose.yaml`   | `PORT` published on the host (10918 by default)              |
| `compose.traefik.yaml`     | behind a Traefik reverse proxy, at `vibrations.cheminfo.org` |
| `compose.cloudflared.yaml` | behind a Cloudflare Tunnel, no published port                |

`docker compose up -d --build` builds the image from this checkout instead of
pulling `ghcr.io/cheminfo/vibrations.cheminfo.org`. Every container answers
`/health`, which is what the server's deploy script probes before it keeps a
new build.

## Licence

GPL-3.0-or-later. The browser engine it is built on is GPL-3.0, and this
application is distributed under the same terms.
