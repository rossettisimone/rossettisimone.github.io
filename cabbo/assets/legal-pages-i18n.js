// Legal Pages i18n Handler
class LegalPagesI18n {
    constructor() {
        // Get language from localStorage or default to 'en'
        this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
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
            console.error('Error initializing legal pages i18n:', error);
        }
    }

    async loadTranslations() {
        try {
            const response = await fetch(`${this.currentLanguage}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English
            this.currentLanguage = 'en';
            const response = await fetch('en.json');
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
        const pageType = this.getPageType();
        if (!pageType) return;

        // Update page title and meta description
        this.updatePageMeta(pageType);
        
        // Update navigation
        this.updateNavigation();
        
        // Update main content
        this.updateMainContent(pageType);
    }

    getPageType() {
        const path = window.location.pathname;
        if (path.includes('privacy-policy')) return 'privacyPolicy';
        if (path.includes('terms-of-service')) return 'termsOfService';
        if (path.includes('cookie-policy')) return 'cookiePolicy';
        return null;
    }

    updatePageMeta(pageType) {
        const title = this.get(`legalPages.${pageType}.title`, 'Legal Page');
        const description = this.get(`legalPages.${pageType}.description`, '');
        
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

    updateNavigation() {
        // Back button is now an image, no text translation needed
    }

    updateMainContent(pageType) {
        // Update elements with data-i18n attributes
        this.updateDataI18nElements();

        // Update main description
        const mainDescription = document.querySelector('.prose p:first-of-type');
        if (mainDescription) {
            const description = this.get(`legalPages.${pageType}.description`, '');
            if (description) {
                mainDescription.innerHTML = description;
            }
        }

        // Update sections based on page type
        this.updateSections(pageType);
        
        // Special handling for privacy policy yourRights section
        if (pageType === 'privacyPolicy') {
            this.updatePrivacyPolicyYourRights();
        }
    }

    updateSections(pageType) {
        if (pageType === 'cookiePolicy') {
            this.updateCookiePolicySections();
        } else {
            // Handle other pages with the original logic
            const sections = this.get(`legalPages.${pageType}.sections`, {});
            const h2Elements = document.querySelectorAll('h2');
            
            h2Elements.forEach((h2, index) => {
                const sectionKeys = Object.keys(sections);
                const sectionKey = sectionKeys[index];
                
                if (sectionKey && sections[sectionKey]) {
                    const section = sections[sectionKey];
                    const sectionTitle = this.get(`legalPages.${pageType}.sections.${sectionKey}.title`, '');
                    
                    h2.textContent = sectionTitle;
                    
                    if (section.description) {
                        const nextParagraph = h2.nextElementSibling;
                        if (nextParagraph && nextParagraph.tagName === 'P') {
                            nextParagraph.textContent = section.description;
                        }
                    }
                    
                    if (section.items) {
                        this.updateSectionItems(h2, section.items);
                    }
                }
            });
        }
    }

    updateCookiePolicySections() {
        // Update "Cookies can be:" text
        const paragraphs = document.querySelectorAll('.prose p');
        paragraphs.forEach(p => {
            const text = p.textContent.trim();
            if (text === 'Cookies can be:') {
                p.textContent = this.get('legalPages.cookiePolicy.sections.whatAreCookies.additionalInfo', 'I cookie possono essere:');
            }
        });

        // Update h2 sections in order
        const h2Elements = document.querySelectorAll('h2');
        const sectionTitles = [
            'legalPages.cookiePolicy.sections.whatAreCookies.title',
            'legalPages.cookiePolicy.sections.typesOfCookies.title',
            'legalPages.cookiePolicy.sections.legalBasis.title',
            'legalPages.cookiePolicy.sections.cookieTable.title',
            'legalPages.cookiePolicy.sections.cookieManagement.title',
            'legalPages.cookiePolicy.sections.updates.title'
        ];

        h2Elements.forEach((h2, index) => {
            if (sectionTitles[index]) {
                h2.textContent = this.get(sectionTitles[index], h2.textContent);
            }
        });

        // Update h3 subsections
        const h3Elements = document.querySelectorAll('h3');
        h3Elements.forEach(h3 => {
            const text = h3.textContent.trim();
            if (text.includes('a)') || text.includes('Strictly Necessary')) {
                h3.textContent = this.get('legalPages.cookiePolicy.sections.typesOfCookies.strictlyNecessary.title', 'a) Strictly Necessary Cookies');
                this.updateCookieSubsectionItems(h3, 'legalPages.cookiePolicy.sections.typesOfCookies.strictlyNecessary.items');
            } else if (text.includes('b)') || text.includes('Performance')) {
                h3.textContent = this.get('legalPages.cookiePolicy.sections.typesOfCookies.performanceAnalytics.title', 'b) Performance and Analytics Cookies');
                this.updateCookieSubsectionItems(h3, 'legalPages.cookiePolicy.sections.typesOfCookies.performanceAnalytics.items');
            } else if (text.includes('c)') || text.includes('Marketing')) {
                h3.textContent = this.get('legalPages.cookiePolicy.sections.typesOfCookies.marketingProfiling.title', 'c) Marketing and Profiling Cookies');
                this.updateCookieSubsectionItems(h3, 'legalPages.cookiePolicy.sections.typesOfCookies.marketingProfiling.items');
            }
        });

        // Update table headers
        this.updateCookieTableHeaders();

        // Update legal basis items
        const legalBasisSection = this.findSectionByTitle('3. Base Legale per il Trattamento') || this.findSectionByTitle('3. Legal Basis for Processing');
        if (legalBasisSection) {
            this.updateSectionItems(legalBasisSection, this.get('legalPages.cookiePolicy.sections.legalBasis.items', []));
        }

        // Update cookie management section
        const cookieManagementSection = this.findSectionByTitle('5. Gestione dei Cookie') || this.findSectionByTitle('5. Cookie Management');
        if (cookieManagementSection) {
            // Find and update the description paragraphs
            let currentElement = cookieManagementSection.nextElementSibling;
            let paragraphCount = 0;
            
            while (currentElement && currentElement.tagName !== 'H2') {
                if (currentElement.tagName === 'P' && !currentElement.querySelector('ul')) {
                    if (paragraphCount === 0) {
                        // First paragraph - description
                        currentElement.textContent = this.get('legalPages.cookiePolicy.sections.cookieManagement.description', '');
                    } else if (paragraphCount === 1) {
                        // Second paragraph - browser settings
                        currentElement.textContent = this.get('legalPages.cookiePolicy.sections.cookieManagement.browserSettings', '');
                    } else if (paragraphCount === 2) {
                        // Third paragraph - note
                        currentElement.textContent = this.get('legalPages.cookiePolicy.sections.cookieManagement.note', '');
                    }
                    paragraphCount++;
                }
                currentElement = currentElement.nextElementSibling;
            }
            
            // Update the list items
            this.updateSectionItems(cookieManagementSection, this.get('legalPages.cookiePolicy.sections.cookieManagement.items', []));
        }

        // Update updates section
        const updatesSection = this.findSectionByTitle('6. Aggiornamenti') || this.findSectionByTitle('6. Updates to This Policy');
        if (updatesSection) {
            // Find and update the description paragraph
            let currentElement = updatesSection.nextElementSibling;
            while (currentElement && currentElement.tagName !== 'H2') {
                if (currentElement.tagName === 'P' && !currentElement.querySelector('ul')) {
                    currentElement.textContent = this.get('legalPages.cookiePolicy.sections.updates.description', '');
                    break;
                }
                currentElement = currentElement.nextElementSibling;
            }
        }
    }

    updateCookieSubsectionItems(h3Element, itemsPath) {
        const items = this.get(itemsPath, []);
        if (items.length > 0) {
            this.updateSectionItems(h3Element, items);
        }
    }

    updateCookieTableHeaders() {
        const tableHeaders = document.querySelectorAll('table th');
        const headers = this.get('legalPages.cookiePolicy.sections.cookieTable.headers', {});
        
        if (tableHeaders.length >= 5) {
            tableHeaders[0].textContent = headers.cookieName || 'Cookie Name';
            tableHeaders[1].textContent = headers.provider || 'Provider';
            tableHeaders[2].textContent = headers.purpose || 'Purpose';
            tableHeaders[3].textContent = headers.duration || 'Duration';
            tableHeaders[4].textContent = headers.type || 'Type';
        }
    }

    findSectionByTitle(title) {
        const h2Elements = document.querySelectorAll('h2');
        for (const h2 of h2Elements) {
            if (h2.textContent.includes(title)) {
                return h2;
            }
        }
        return null;
    }

    updatePrivacyPolicyYourRights() {
        const yourRightsSection = this.findSectionByTitle('6. I Tuoi Diritti') || this.findSectionByTitle('6. Your Rights');
        if (yourRightsSection) {
            // Find and update the contact info paragraph
            let currentElement = yourRightsSection.nextElementSibling;
            while (currentElement && currentElement.tagName !== 'H2') {
                if (currentElement.tagName === 'P' && currentElement.textContent.includes('To exercise your rights') || currentElement.textContent.includes('Per esercitare i tuoi diritti')) {
                    currentElement.textContent = this.get('legalPages.privacyPolicy.sections.yourRights.contactInfo', '') + ' ';
                    
                    // Add the email link
                    const emailLink = document.createElement('a');
                    emailLink.href = 'mailto:support@example.com';
                    emailLink.className = 'text-brand-green hover:underline';
                    emailLink.textContent = 'support@example.com';
                    currentElement.appendChild(emailLink);
                    currentElement.appendChild(document.createTextNode('.'));
                    break;
                }
                currentElement = currentElement.nextElementSibling;
            }
        }
    }

    updateSectionItems(sectionTitle, items) {
        // Find the next ul element after the section title
        let currentElement = sectionTitle.nextElementSibling;
        while (currentElement && currentElement.tagName !== 'UL') {
            currentElement = currentElement.nextElementSibling;
        }
        
        if (currentElement && currentElement.tagName === 'UL') {
            const listItems = currentElement.querySelectorAll('li');
            items.forEach((item, index) => {
                if (listItems[index]) {
                    listItems[index].innerHTML = item;
                }
            });
        }
    }

    updateContactSection() {
        // All contact section elements are now handled by data-i18n attributes
        // This method is kept for potential future use or specific contact section logic
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
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main i18n to be ready
    const initLegalI18n = () => {
        if (window.i18n && window.i18n.loaded) {
            window.legalPagesI18n = new LegalPagesI18n();
        } else {
            setTimeout(initLegalI18n, 100);
        }
    };
    
    initLegalI18n();
});
