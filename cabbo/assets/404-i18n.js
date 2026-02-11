// 404 Page i18n Handler
class Error404I18n {
    constructor() {
        // Get language from localStorage or default to 'en'
        this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
        console.log('404 i18n initialized with language:', this.currentLanguage);
        this.translations = {};
        this.loaded = false;
        this.init();
    }

    async init() {
        try {
            // Load translations based on current language
            await this.loadTranslations();
            this.loaded = true;
            
            // Apply translations to the current page
            this.applyTranslations();
            
            // Initialize language switcher
            this.initLanguageSwitcher();
            
            // Listen for language changes
            window.addEventListener('languageChanged', () => {
                this.currentLanguage = window.i18n ? window.i18n.currentLanguage : 'en';
                // Update localStorage to match
                localStorage.setItem('preferredLanguage', this.currentLanguage);
                this.loadTranslations().then(() => {
                    this.applyTranslations();
                });
            });
        } catch (error) {
            console.error('Error initializing 404 page i18n:', error);
        }
    }

    async loadTranslations() {
        const base = (document.querySelector('base') && document.querySelector('base').getAttribute('href')) || '';
        try {
            const response = await fetch(`${base}${this.currentLanguage}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English
            this.currentLanguage = 'en';
            const response = await fetch(`${base}en.json`);
            this.translations = await response.json();
        }
    }

    get(path, fallback = '') {
        const keys = path.split('.');
        let value = this.translations;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return fallback;
            }
        }
        
        return value || fallback;
    }

    applyTranslations() {
        console.log('Applying translations for language:', this.currentLanguage);
        console.log('Translations loaded:', this.translations);
        console.log('Error404 translations:', this.get('error404'));
        
        // Update page title and meta description
        this.updatePageMeta();
        
        // Update all elements with data-i18n attributes
        this.updateDataI18nElements();
    }

    updatePageMeta() {
        const title = this.get('error404.title', '404 - Page Not Found');
        const description = this.get('error404.description', 'The page you\'re looking for doesn\'t exist. Return to Cabbo\'s homepage.');
        
        // Update page title
        document.title = `${title} - Cabbo: AI-Powered Agricultural Decision Support System`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', description);
        }
        
        // Update html lang attribute
        document.documentElement.lang = this.currentLanguage;
    }

    updateDataI18nElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                element.textContent = this.get(key);
            }
        });
    }

    initLanguageSwitcher() {
        const languageSwitcher = document.getElementById('language-switcher');
        const languageDropdown = document.getElementById('language-dropdown');
        const currentLanguageSpan = document.getElementById('current-language');
        const languageOptions = document.querySelectorAll('.language-option');

        if (!languageSwitcher || !languageDropdown) return;

        let isDropdownOpen = false;

        // Update current language display
        const updateLanguageDisplay = () => {
            const displayNames = {
                'en': 'EN',
                'it': 'IT'
            };
            if (currentLanguageSpan) {
                currentLanguageSpan.textContent = displayNames[this.currentLanguage] || 'EN';
            }
        };

        // Toggle dropdown function
        const toggleDropdown = () => {
            isDropdownOpen = !isDropdownOpen;
            if (isDropdownOpen) {
                languageDropdown.classList.remove('hidden');
            } else {
                languageDropdown.classList.add('hidden');
            }
        };

        // Close dropdown function
        const closeDropdown = () => {
            isDropdownOpen = false;
            languageDropdown.classList.add('hidden');
        };

        // Language switcher click handler
        languageSwitcher.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });

        // Close dropdown when clicking outside
        const handleOutsideClick = (e) => {
            if (!languageSwitcher.contains(e.target) && !languageDropdown.contains(e.target)) {
                closeDropdown();
            }
        };

        // Close dropdown on Escape key
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                closeDropdown();
            }
        };

        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleEscapeKey);

        // Language option click handlers
        languageOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                const lang = option.getAttribute('data-lang');
                if (lang && lang !== this.currentLanguage) {
                    // Show loading screen
                    this.showLoadingScreen();
                    
                    this.currentLanguage = lang;
                    // Save to localStorage
                    localStorage.setItem('preferredLanguage', lang);
                    
                    try {
                        await this.loadTranslations();
                        this.applyTranslations();
                        updateLanguageDisplay();
                        closeDropdown();
                    } catch (error) {
                        console.error('Error changing language:', error);
                    } finally {
                        // Hide loading screen after content is updated
                        setTimeout(() => {
                            this.hideLoadingScreen();
                        }, 500); // Delay to ensure content is rendered
                    }
                }
            });
        });

        // Initial display update
        updateLanguageDisplay();
        console.log('Language switcher initialized. Current language:', this.currentLanguage);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize immediately without waiting for main i18n
    window.error404I18n = new Error404I18n();
});
