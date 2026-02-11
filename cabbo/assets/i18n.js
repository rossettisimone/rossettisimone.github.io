// Internationalization System for Cabbo
class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.loaded = false;
        this.supportedLanguages = ['en', 'it'];
    }

    // Initialize the i18n system
    async init(language = null) {
        // Detect language from browser or localStorage
        if (!language) {
            language = this.detectLanguage();
        }
        
        // Validate language is supported
        if (!this.supportedLanguages.includes(language)) {
            language = 'en'; // fallback to English
        }
        
        this.currentLanguage = language;
        await this.loadTranslations();
        this.loaded = true;
        this.updatePageContent();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('i18nReady', {
            detail: { language: this.currentLanguage, translations: this.translations }
        }));
    }

    // Detect user's preferred language
    detectLanguage() {
        // Check localStorage first
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            return savedLanguage;
        }
        
        // Check browser language
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage) {
            const langCode = browserLanguage.split('-')[0].toLowerCase();
            if (this.supportedLanguages.includes(langCode)) {
                return langCode;
            }
        }
        
        return 'en'; // default fallback
    }

    // Load translations from JSON file
    async loadTranslations() {
        try {
            const response = await fetch(`${this.currentLanguage}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${this.currentLanguage}.json`);
            }
            this.translations = await response.json();
            console.log(`Loaded translations for ${this.currentLanguage}`);
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English if the requested language fails
            if (this.currentLanguage !== 'en') {
                console.log('Falling back to English');
                this.currentLanguage = 'en';
                await this.loadTranslations();
            }
        }
    }

    // Get a translation by key path (e.g., 'navigation.home')
    get(key, defaultValue = '') {
        if (!this.loaded) {
            console.warn('I18n not loaded yet');
            return defaultValue;
        }

        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return defaultValue;
            }
        }

        return value || defaultValue;
    }

    // Update meta tags
    updateMetaTags() {
        const title = this.get('meta.title');
        const description = this.get('meta.description');
        const ogTitle = this.get('meta.ogTitle');
        const ogDescription = this.get('meta.ogDescription');

        if (title) document.title = title;
        if (description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', description);
        }
        if (ogTitle) {
            const ogTitleMeta = document.querySelector('meta[property="og:title"]');
            if (ogTitleMeta) ogTitleMeta.setAttribute('content', ogTitle);
        }
        if (ogDescription) {
            const ogDescMeta = document.querySelector('meta[property="og:description"]');
            if (ogDescMeta) ogDescMeta.setAttribute('content', ogDescription);
        }
    }

    // Update navigation elements
    updateNavigation() {
        // All navigation elements are now handled by data-i18n attributes
        // This method is kept for potential future use or specific navigation logic
    }

    // Update hero section
    updateHero() {
        // All hero elements are now handled by data-i18n attributes
        // This method is kept for potential future use or specific hero logic
    }

    // Update section titles
    updateSections() {
        // All section elements are now handled by data-i18n attributes
        // Update elements with data-i18n attributes
        this.updateDataI18nElements();
    }

    // Update elements with data-i18n attributes
    updateDataI18nElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                // Special handling for elements that contain HTML
                if (key === 'cookieBanner.message') {
                    const message = this.get(key);
                    const policyLink = this.get('footer.cookiePolicy');
                    element.innerHTML = message.replace('Cookie Policy', `<a href="cookie-policy.html" target="_blank">${policyLink}</a>`);
                } else if (key === 'footer.copyright') {
                    const copyrightText = this.get(key);
                    element.innerHTML = copyrightText.replace('Cabbo', '<a href="https://rossettisimone.github.io/cabbo" class="text-brand-green hover:underline">Cabbo</a>');
                } else {
                    element.textContent = this.get(key);
                }
            }
        });

        // Update elements with data-i18n-placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (key) {
                element.placeholder = this.get(key);
            }
        });
    }

    // Update footer
    updateFooter() {
        // All footer elements are now handled by data-i18n attributes
        // This method is kept for potential future use or specific footer logic
    }

    // Update cookie banner
    updateCookieBanner() {
        // All cookie banner elements are now handled by data-i18n attributes
        // This method is kept for potential future use or specific cookie banner logic
    }

    // Update cookie preferences modal
    updateCookiePreferences() {
        // All cookie preferences elements are now handled by data-i18n attributes
        // This method is kept for potential future use or specific cookie preferences logic
    }

    // Update all page content
    updatePageContent() {
        this.updateMetaTags();
        this.updateNavigation();
        this.updateHero();
        this.updateSections();
        this.updateFooter();
        this.updateCookieBanner();
        this.updateCookiePreferences();
    }

    // Change language
    async changeLanguage(language) {
        if (language === this.currentLanguage) return;
        
        // Validate language is supported
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`Language ${language} is not supported. Supported languages: ${this.supportedLanguages.join(', ')}`);
            return;
        }
        
        // Show loading screen immediately
        this.showLoadingScreen();
        
        this.currentLanguage = language;
        
        // Save preference to localStorage
        localStorage.setItem('preferredLanguage', language);
        
        try {
            await this.loadTranslations();
            this.updatePageContent();
            
            // Trigger custom event for other components
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language, translations: this.translations }
            }));
        } catch (error) {
            console.error('Error changing language:', error);
        } finally {
            // Hide loading screen after content is updated
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 500); // Increased delay to ensure all content is rendered
        }
    }

    // Get supported languages
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    // Get language display names
    getLanguageDisplayNames() {
        return {
            'en': 'English',
            'it': 'Italiano'
        };
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get all translations
    getAllTranslations() {
        return this.translations;
    }

    // Show loading screen
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            loadingScreen.style.opacity = '1';
            loadingScreen.style.transition = 'opacity 0.3s ease-in';
        }
    }

    // Hide loading screen
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
}

// Create global i18n instance
window.i18n = new I18n();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await window.i18n.init();
});
