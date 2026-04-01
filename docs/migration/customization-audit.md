# Green Envee Retail Pipeline 7.4.1 -> 8.1.1 Customization Audit

## Source branches

- Live source of truth: `master`
- Clean vendor baseline: `vendor/pipeline-7.4.1`
- Upgrade target baseline: `vendor/pipeline-8.1.1`

## Audit summary

- Diff scope from `vendor/pipeline-7.4.1` to `master`: 61 files
- Main customization areas:
  - Theme settings and customizer state
  - Header, footer, overlay, and page/template composition
  - Hidden-product behavior across collection, search, predictive search, and PDP
  - Contact form schema and required-field support
  - App/theme embeds and third-party scripts
  - Brand styling, fonts, and a small amount of custom CSS

## Migration checklist

- [ ] Port `config/settings_data.json` current settings and app embeds
- [ ] Port JSON template customizer state and preserve legacy template files
- [ ] Port header/footer/overlay group JSON customizations
- [ ] Port hidden-product filtering and redirect logic
- [ ] Port metafield-powered search result additions
- [ ] Port contact form required-field schema and rendering changes
- [ ] Port app-related theme customizations and third-party scripts
- [ ] Port brand asset/style tweaks
- [ ] Verify legacy templates still render on 8.1.1
- [ ] Update `staging` for QA

## Customization units

### 1. Branding and customizer state

- `config/settings_data.json`
  - Retail-specific palette, typography, favicon, social links, collection alignment, badge settings, and app embed configuration.
  - Identified app embeds:
    - `shopify://apps/fontify/blocks/app-embed/...`
    - `shopify://apps/bogos-io-free-gift/blocks/app-embed/...`
- `assets/font-settings.css`
  - Fonts changed to Josefin Sans weights hosted on the Green Envee storefront CDN.
- `assets/cursor-arrow-left.svg`
- `assets/cursor-arrow-left-2x.svg`
- `assets/cursor-arrow-right.svg`
- `assets/cursor-arrow-right-2x.svg`
- `assets/ico-select.svg`
  - Brand color adjustments.
- `assets/theme.css`
  - Footer heading weight override.
  - BOGOS gift widget quantity input spacing override.
- `locales/en.default.json`
  - Copy overrides include cart/order language, out-of-stock messaging, and suppression of Shopify boilerplate text.

### 2. Theme shell and third-party embeds

- `layout/theme.liquid`
  - Adds two Jivo chat script includes.
  - Renders `snippets/freegifts-snippet-change.liquid` before `</body>`.
- `snippets/freegifts-snippet-change.liquid`
  - BOGOS/free-gift snippet preserved from live theme.

### 3. Hidden-product logic

- `sections/collection.liquid`
  - Excludes products tagged `hidden` from collection grids.
- `sections/product.liquid`
  - Redirects hidden-tagged PDPs to `/` with a `noscript` fallback.
- `sections/search.liquid`
  - Excludes hidden-tagged products from standard search results.
- `sections/predictive-search.liquid`
- `snippets/search-predictive.liquid`
  - Excludes hidden-tagged products from predictive search.

### 4. Metafield search customization

- `sections/search.liquid`
- `sections/predictive-search.liquid`
  - Adds supplemental results by searching `product.metafields.custom` across `collections.ge-full-inventory.products`.
  - Uses `collections['hidden-products']` to suppress hidden handles from those injected results.

### 5. Contact form schema extension

- `sections/section-contact.liquid`
  - Adds a `required` setting to multiple field block types.
  - Applies required attributes and visual indicators in form markup.
  - Changes the single-checkbox label field from `text` to `richtext`.

### 6. Header, footer, overlay, and page composition

- `sections/group-header.json`
  - Retail announcement slider content, split header layout, transparent logo config, and menu image promos.
- `sections/group-footer.json`
  - Retail footer menus, social title, and layout/padding changes.
- `sections/group-overlay.json`
  - Drawer cart presentation settings and popup settings.

### 7. Template inventory and legacy preservation

- Modified core templates:
  - `templates/article.json`
  - `templates/blog.json`
  - `templates/cart.json`
  - `templates/collection.json`
  - `templates/index.json`
  - `templates/page.about.json`
  - `templates/page.contact.json`
  - `templates/page.json`
  - `templates/password.json`
  - `templates/product.json`
  - `templates/search.json`
- Added legacy/custom templates that must be preserved on upgrade:
  - `templates/collection.body-care.json`
  - `templates/page.become-a-spa-partner.json`
  - `templates/page.careers.json`
  - `templates/page.envee-collective.json`
  - `templates/page.envee-editorial.json`
  - `templates/page.faqs.json`
  - `templates/page.job-application.json`
  - `templates/page.job-posting.json`
  - `templates/page.policies-guidelines.json`
  - `templates/page.post-application-business.json`
  - `templates/page.pre-partner-app-form.json`
  - `templates/page.privacy-policy.json`
  - `templates/page.purity-potency-promise.json`
  - `templates/page.shop-by-aroma-collection.json`
  - `templates/page.shop-by-skin-type.json`
  - `templates/page.skincare-treatment-agree.json`
  - `templates/page.spa-locator.json`
  - `templates/page.terms-conditions.json`
  - `templates/page.terms-of-use.json`
  - `templates/page.thank-you-business-school.json`
  - `templates/page.thank-you-student.json`
  - `templates/page.toxic-nix-it-list.json`
  - `templates/page.upcoming-events.json`
  - `templates/page.wellness-promise.json`
  - `templates/product.product-and-info.json`
  - `templates/product.product-social-and-info.json`
- Vendor 7.4.1 templates absent from live and treated as retired by the live source of truth:
  - `templates/page.faq.json`
  - `templates/page.lookbook.json`
  - `templates/page.story.json`
  - `templates/page.team.json`

## External dependencies to keep in mind during QA

- Smart collection handle: `hidden-products`
- Collection handle used for metafield-driven search augmentation: `ge-full-inventory`
- Jivo chat widget scripts
- BOGOS Free Gift app blocks/snippet/CSS
- Fontify app embed
