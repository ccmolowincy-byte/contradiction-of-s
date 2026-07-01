/* ── Shared type definitions for the open forum ─────────────────────────────
 * These JSDoc typedefs describe the shape of paper stickers and floating
 * forum text boxes so that sticker.js, character-build.js, and community.js
 * all refer to the same contract.
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * A client-generated paper sticker (drawn in the sticker/cutout flow).
 * Stored in localStorage under the `cos_stickers` key.
 *
 * @typedef {Object} PaperSticker
 * @property {number} id           - Local timestamp used as a local identifier.
 * @property {string} prompt       - The prompt shown when the sticker was drawn.
 * @property {string} image        - PNG data URL of the sticker artwork.
 * @property {string} created      - ISO timestamp of when the sticker was saved.
 * @property {boolean} [isPaperCutout] - True if created via the scissors cutout tool.
 * @property {boolean} [hasDrawing]    - True if brush marks were drawn on the sticker.
 */

/**
 * A story row persisted in Supabase `public.community_stories`.
 *
 * @typedef {Object} StoryEntry
 * @property {string} id           - Supabase-generated UUID.
 * @property {string} content      - The visitor's story text.
 * @property {string} [nickname]   - Optional explicit signature; omit for anonymous.
 * @property {Object} [sticker_data] - Embedded paper sticker object.
 * @property {string} [svg_texture] - Stringified transparent SVG of the text block.
 * @property {string} created_at   - ISO timestamp from Supabase.
 */

/**
 * A rendered floating forum text box in the DOM.
 *
 * @typedef {Object} FloatingBox
 * @property {StoryEntry} story    - The source story data.
 * @property {HTMLElement} el      - The rendered card element.
 */
