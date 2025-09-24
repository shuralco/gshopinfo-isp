#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');

const API_BASE_URL = process.env.STRAPI_API_URL || 'https://g-shop.info/api';
const READ_TOKEN = process.env.STRAPI_READ_TOKEN || process.env.STRAPI_API_TOKEN || null;

const endpoints = {
  heroSection: '/hero-section',
  siteSettings: '/site-setting',
  features: '/features',
  products: '/products',
  brands: '/brands?populate=categories',
  testimonials: '/testimonials',
  categories: '/categories?populate=brand'
};

async function fetchJson(key, endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Accept': 'application/json'
  };
  if (READ_TOKEN) {
    headers['Authorization'] = `Bearer ${READ_TOKEN}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`${key} request failed (${response.status}) ${body}`);
  }

  const json = await response.json();
  return json;
}

async function main() {
  console.log('🗃️  Prefetching Strapi content...');

  const payload = {};
  for (const [key, endpoint] of Object.entries(endpoints)) {
    try {
      console.log(`  ↳ Fetching ${key} (${endpoint})`);
      payload[key] = await fetchJson(key, endpoint);
    } catch (error) {
      console.error(`❌ Failed to fetch ${key}:`, error.message);
      throw error;
    }
  }

  const outputDir = path.join(__dirname, '..', 'frontend', 'generated');
  const outputJsonFile = path.join(outputDir, 'content.json');
  const outputJsFile = path.join(outputDir, 'content.js');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputJsonFile, JSON.stringify(payload, null, 2), 'utf8');
  await fs.writeFile(outputJsFile, `window.__STRAPI_CONTENT__ = ${JSON.stringify(payload)};\n`, 'utf8');

  console.log(`✅ Content written to ${path.relative(process.cwd(), outputJsonFile)} and ${path.relative(process.cwd(), outputJsFile)}`);

  await updateIndexHtml(payload);
}

main().catch((error) => {
  console.error('\nBuild prefetch failed. Set STRAPI_API_URL/STRAPI_READ_TOKEN if needed.');
  process.exitCode = 1;
});

async function updateIndexHtml(payload) {
  const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
  let html = await fs.readFile(indexPath, 'utf8');

  const hero = payload.heroSection?.data?.attributes || {};
  const site = payload.siteSettings?.data?.attributes || {};
  const features = (payload.features?.data || []).map(item => item.attributes || {});

  const replacements = [
    { id: 'hero-tagline', value: hero.badge_text || '' },
    { id: 'hero-title', value: hero.main_title ? `<span class="block">${hero.main_title}</span>` : '' },
    { id: 'hero-subtitle', value: hero.description || hero.subtitle || '' },
    { id: 'hero-cta-primary', value: hero.cta_primary_text || '' },
    { id: 'hero-cta-secondary', value: hero.cta_secondary_text || '' }
  ];

  const heroPrimaryLink = hero.cta_primary_link || '#products-section';
  const heroSecondaryLink = hero.cta_secondary_link || '#footer-section';
  html = replaceLinkHref(html, 'hero-cta-primary-link', heroPrimaryLink);
  html = replaceLinkHref(html, 'hero-cta-secondary-link', heroSecondaryLink);

  const featureSlots = 6;
  for (let i = 0; i < featureSlots; i++) {
    const feature = features[i] || {};
    replacements.push({ id: `feature-${i + 1}-title`, value: feature.title || '' });
    replacements.push({ id: `feature-${i + 1}-description`, value: feature.description || '' });
  }

  const navMap = {
    'nav-home': site.nav_home,
    'nav-products': site.nav_products,
    'nav-brands': site.nav_brands,
    'nav-about': site.nav_about,
    'nav-contacts': site.nav_contacts,
    'mobile-nav-home': site.nav_home,
    'mobile-nav-products': site.nav_products,
    'mobile-nav-brands': site.nav_brands,
    'mobile-nav-about': site.nav_about,
    'mobile-nav-contacts': site.nav_contacts,
  };

  for (const [id, value] of Object.entries(navMap)) {
    if (value) {
      replacements.push({ id, value });
    }
  }

  const footerMap = {
    'footer-company-name': site.site_name,
    'footer-company-description': site.footer_description,
    'footer-address': site.contact_address_full || site.address,
    'contact-address': site.contact_address_full || site.address,
    'hero-cta-secondary': hero.cta_secondary_text,
  };

  for (const [id, value] of Object.entries(footerMap)) {
    if (value) {
      replacements.push({ id, value });
    }
  }

  replacements.forEach(({ id, value }) => {
    if (typeof value === 'undefined') return;
    html = replaceInner(html, id, value);
  });

  await fs.writeFile(indexPath, html, 'utf8');
  console.log(`✅ Updated initial HTML content in ${path.relative(process.cwd(), indexPath)}`);
}

function replaceInner(html, id, value) {
  const pattern = new RegExp(`(<[a-zA-Z0-9]+[^>]*id=["']${id}["'][^>]*>)([\\s\\S]*?)(</[a-zA-Z0-9]+>)`);
  return html.replace(pattern, (_, start, _inner, end) => `${start}${value || ''}${end}`);
}

function replaceLinkHref(html, linkId, href) {
  const pattern = new RegExp(`(<a[^>]*id=["']${linkId}["'][^>]*href=)["'][^"']*["']`);
  return html.replace(pattern, `$1"${href}"`);
}
