import { PageId } from '../types';
import { saveSingleAppState, fetchSingleAppState } from './firebaseService';

export const ALL_PORTAL_PAGES: { id: PageId; priority: string; changefreq: string }[] = [
  { id: 'home', priority: '1.0', changefreq: 'daily' },
  { id: 'about', priority: '0.8', changefreq: 'monthly' },
  { id: 'principal-message', priority: '0.8', changefreq: 'monthly' },
  { id: 'vision-mission', priority: '0.7', changefreq: 'monthly' },
  { id: 'administration', priority: '0.7', changefreq: 'monthly' },
  { id: 'faculty', priority: '0.7', changefreq: 'weekly' },
  { id: 'departments', priority: '0.7', changefreq: 'monthly' },
  { id: 'academic-programs', priority: '0.9', changefreq: 'weekly' },
  { id: 'classes', priority: '0.8', changefreq: 'weekly' },
  { id: 'academic-calendar', priority: '0.8', changefreq: 'weekly' },
  { id: 'examination', priority: '0.8', changefreq: 'weekly' },
  { id: 'results', priority: '0.9', changefreq: 'daily' },
  { id: 'syllabus', priority: '0.8', changefreq: 'weekly' },
  { id: 'admission-info', priority: '1.0', changefreq: 'daily' },
  { id: 'eligibility', priority: '0.8', changefreq: 'monthly' },
  { id: 'admission-process', priority: '0.9', changefreq: 'monthly' },
  { id: 'required-documents', priority: '0.8', changefreq: 'monthly' },
  { id: 'fee-structure', priority: '0.9', changefreq: 'monthly' },
  { id: 'apply-admission', priority: '1.0', changefreq: 'daily' },
  { id: 'notices', priority: '0.9', changefreq: 'daily' },
  { id: 'events', priority: '0.8', changefreq: 'weekly' },
  { id: 'news', priority: '0.8', changefreq: 'daily' },
  { id: 'gallery', priority: '0.7', changefreq: 'weekly' },
  { id: 'downloads', priority: '0.8', changefreq: 'weekly' },
  { id: 'contact', priority: '0.8', changefreq: 'monthly' },
  { id: 'student-login', priority: '0.6', changefreq: 'monthly' },
  { id: 'student-register', priority: '0.6', changefreq: 'monthly' },
  { id: 'admin-login', priority: '0.3', changefreq: 'yearly' },
];

export async function generateAndSaveSitemapXml(baseUrl: string = window.location.origin): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  let urlEntries = ALL_PORTAL_PAGES.map(page => {
    const loc = page.id === 'home' ? `${baseUrl}/` : `${baseUrl}/#${page.id}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }).join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  try {
    const state = await fetchSingleAppState() || {};
    await saveSingleAppState({
      ...state,
      sitemapXml: xmlContent,
      sitemapGeneratedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Could not persist sitemap to Firebase single doc:', err);
  }

  return xmlContent;
}

export async function getStoredSitemapXml(): Promise<string> {
  try {
    const state = await fetchSingleAppState();
    if (state && (state as any).sitemapXml) {
      return (state as any).sitemapXml;
    }
  } catch {}
  return await generateAndSaveSitemapXml();
}
