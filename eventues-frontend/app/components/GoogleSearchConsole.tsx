'use client';

import { useEffect } from 'react';

interface GoogleSearchConsoleProps {
  verificationCode?: string;
}

const GoogleSearchConsole: React.FC<GoogleSearchConsoleProps> = ({ 
  verificationCode = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE 
}) => {
  useEffect(() => {
    // Add Google Search Console verification meta tag dynamically
    if (verificationCode && typeof window !== 'undefined') {
      const existingMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!existingMeta) {
        const meta = document.createElement('meta');
        meta.name = 'google-site-verification';
        meta.content = verificationCode;
        document.head.appendChild(meta);
      }
    }

    // Add structured data for Google Search Console
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Eventues',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com'}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };

    const existingScript = document.querySelector('script[data-search-console="true"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-search-console', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [verificationCode]);

  return null;
};

// Helper function to submit sitemap to Google Search Console
export const submitSitemapToGoogle = async (sitemapUrl: string) => {
  try {
    // This would typically be done through Google Search Console API
    // For now, we'll log the sitemap URL for manual submission
    console.log('Submit this sitemap to Google Search Console:', sitemapUrl);
    
    // In production, you would use Google Search Console API:
    // const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    return { success: true, message: 'Sitemap ready for submission' };
  } catch (error) {
    console.error('Error preparing sitemap submission:', error);
    return { success: false, error };
  }
};

// Helper function to ping search engines about sitemap updates
export const pingSitemapUpdate = async () => {
  const sitemapUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com'}/sitemap.xml`;
  
  try {
    // Ping Google
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    
    // Ping Bing
    await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    
    console.log('Sitemap update pinged to search engines');
    return { success: true };
  } catch (error) {
    console.error('Error pinging sitemap update:', error);
    return { success: false, error };
  }
};

export default GoogleSearchConsole;
