import type { LoyaltyClassSpec } from './google.js';

const SITE_BASE = 'https://www.gyrosheroes.rs';

export function buildLoyaltyClass(opts: {
  classId: string;
  reviewStatus?: 'DRAFT' | 'UNDER_REVIEW';
}): LoyaltyClassSpec {
  return {
    id: opts.classId,
    issuerName: 'Gyros Heroes',
    programName: 'Hero kartica',
    programLogo: {
      sourceUri: { uri: `${SITE_BASE}/wallet/logo-660.png` },
      contentDescription: {
        defaultValue: { language: 'sr', value: 'Gyros Heroes logo' },
      },
    },
    heroImage: {
      sourceUri: { uri: `${SITE_BASE}/wallet/hero-1032x336.png` },
      contentDescription: {
        defaultValue: { language: 'sr', value: 'Gyros Heroes — autentični gyros' },
      },
    },
    hexBackgroundColor: '#4866B0',
    countryCode: 'RS',
    localizedIssuerName: {
      defaultValue: { language: 'sr', value: 'Gyros Heroes' },
    },

    // Per-user loyaltyPoints + secondaryLoyaltyPoints on each LoyaltyObject
    // already carry the labels + values. The class-level rewardsTier* fields
    // would render a second, stale "Pečati: 0" row in the details panel.

    textModulesData: [
      {
        id: 'how_it_works',
        header: 'Kako funkcioniše',
        body: 'Pokaži ovu karticu pri svakoj poseti. Kada sakupiš 10 pečata, sledeći gyros je na nas.',
      },
      {
        id: 'rules',
        header: 'Pravila',
        body: 'Hero kartica važi u svim Gyros Heroes lokacijama u Nišu i Novom Sadu. Po lokaciji jedan pečat dnevno. Kartica je personalna i nije prenosiva. Gyros Heroes zadržava pravo izmena uslova programa uz prethodnu najavu.',
      },
    ],

    linksModuleData: {
      uris: [
        { uri: `${SITE_BASE}/loyalty/card`, description: 'Otvori karticu' },
        { uri: SITE_BASE, description: 'Sajt' },
      ],
    },

    locations: [
      { latitude: 43.3185, longitude: 21.8956 },
      { latitude: 43.3207, longitude: 21.9192 },
      { latitude: 45.252, longitude: 19.838 },
    ],

    multipleDevicesAndHoldersAllowedStatus: 'ONE_USER_ALL_DEVICES',
    reviewStatus: opts.reviewStatus ?? 'DRAFT',
  };
}
