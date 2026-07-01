import glsl from 'vite-plugin-glsl';

// Vendored Elemental-Serenity, built as an isolated sub-app of the Contradiction
// of S static site. Served at /swim/ and emitted into ../web/swim so the existing
// @vercel/static deploy of web/ picks it up with no extra build step.
export default {
  base: '/swim/',
  plugins: [glsl()],
  build: {
    outDir: '../web/swim',
    emptyOutDir: true,
  },
};
