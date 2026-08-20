# Design

<!-- impeccable:design-schema 1 -->

Light print stock. Ink on paper. Contemporary, not aged.

## Palette

- `--stock` `#F2F1ED`
- `--ink` `#16161A`
- `--ink-mid` `#5A5A62` (AA on stock)
- `--rule` `#D6D4CC`
- `--verify` `#0C8F45` (depth glyph only)

## Type

Nine styles. Mono is structure. Serif is the argument, about six times a page.

- Display: PP Editorial New at three sizes (hero, section, lede)
- Mono: Geist Mono at three sizes (nav/cta, value, label/caption/footer)

## Layout

Record grid everywhere: fixed mono label column, value column, hairline between rows. Section padding 96/64/48. Measure 62ch. Only the hero is a full viewport.

## States

Unresolved (sparse drifting dots), resolving (dots gathering), resolved (solid ink). Outcome never resolves.

## Mark

Official lockup is the SVG lens: four-point star punched from a halftone, horizontal trail, traced Elestar wordmark. Circles via `<use>`. Depth glyph is one star path masked by a dot pattern.

On `/` only: one xerox eye, fixed and centered behind the whole page, resting opacity 0.055, scroll-modulated in the gutters. Body copy sits on `.surface` (stock 0.94). Never a second face plate. Wall cards use each person's real work image. Never a second logo, never crumpled-page texture, never campaign copy.

## Routes

`/` shared mechanic and fork. `/candidates` second person, defuses rejection first. `/hiring` buyer page: cost, count (10), desk flow, NDA, DKIM, outcome objection.
