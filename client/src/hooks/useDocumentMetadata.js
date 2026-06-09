import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook to dynamically update page SEO metadata: title, description, canonical URL, and hreflang alternates.
 * @param {string} title - The translated page title.
 * @param {string} description - The translated page description.
 */
export default function useDocumentMetadata(title, description) {
    const { i18n } = useTranslation();

    useEffect(() => {
        // Update document title
        if (title) {
            document.title = title;
        }

        // Manage Meta Description
        let metaDescription = document.querySelector(
            'meta[name="description"]',
        );
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        if (description) {
            metaDescription.setAttribute('content', description);
        }

        // Manage Canonical URL
        const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonicalUrl);

        // Update html lang attribute
        const currentLang = i18n.language || 'en';
        document.documentElement.setAttribute('lang', currentLang);

        // Manage Multilingual Alternate Links (hreflang)
        // Clean existing alternate links to avoid duplication
        const oldAlternates = document.querySelectorAll(
            'link[rel="alternate"][hreflang]',
        );
        oldAlternates.forEach((el) => el.remove());

        const supportedLanguages = ['pl', 'en'];
        supportedLanguages.forEach((lang) => {
            const alternateLink = document.createElement('link');
            alternateLink.setAttribute('rel', 'alternate');
            alternateLink.setAttribute('hreflang', lang);
            alternateLink.setAttribute(
                'href',
                `${window.location.origin}${window.location.pathname}`,
            );
            document.head.appendChild(alternateLink);
        });

        // Add x-default fallback alternate link
        const defaultLink = document.createElement('link');
        defaultLink.setAttribute('rel', 'alternate');
        defaultLink.setAttribute('hreflang', 'x-default');
        defaultLink.setAttribute(
            'href',
            `${window.location.origin}${window.location.pathname}`,
        );
        document.head.appendChild(defaultLink);
    }, [title, description, i18n.language]);
}
