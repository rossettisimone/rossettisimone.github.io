// Polyfill for older browsers
if (!Element.prototype.closest) {
    Element.prototype.closest = function(css) {
        var node = this;
        while (node) {
            if (node.matches(css)) return node;
            node = node.parentElement;
        }
        return null;
    };
}

if (!Element.prototype.matches) {
    Element.prototype.matches = 
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

// Function to populate capabilities from i18n data
function populateCapabilities() {
    const capabilitiesContainer = document.getElementById('capabilities-grid');
    if (!capabilitiesContainer || !window.i18n || !window.i18n.loaded) return;

    const capabilities = window.i18n.get('data.capabilities', []);
    
    capabilitiesContainer.innerHTML = ''; // Clear existing content
    
    capabilities.forEach(cap => {
        const capCard = document.createElement('div');
        capCard.className = 'bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300';
        capCard.innerHTML = `
            <h3 class="text-xl font-bold text-brand-green mb-2">${cap.name || window.i18n.get('fallbacks.capability')}</h3>
            <p class="text-brand-charcoal">${cap.description || window.i18n.get('fallbacks.descriptionNotAvailable')}</p>
        `;
        capabilitiesContainer.appendChild(capCard);
    });
}

// Function to populate use cases from i18n data
function populateUseCases() {
    const useCasesContainer = document.getElementById('use-cases-grid');
    const filtersContainer = document.getElementById('use-case-filters');
    const searchInput = document.getElementById('use-case-search');

    if (!useCasesContainer || !window.i18n || !window.i18n.loaded) {
        return;
    }

    const useCases = window.i18n.get('data.useCases', []);

    // Extract unique filters with more comprehensive approach
    const userFilters = [...new Set(useCases.flatMap(uc => 
        uc['User Segment'] ? uc['User Segment'].split(', ') : []
    ))];
    const categoryFilters = [...new Set(useCases.map(uc => 
        uc.Category ? uc.Category.replace(/"/g, '').split(', ')[0] : 'Other'
    ))];

    // Create filter buttons with active state
    function createFilterButtons() {
        if (filtersContainer) {
            filtersContainer.innerHTML = ''; // Clear existing filters
            [...userFilters, ...categoryFilters].forEach(filter => {
                const filterBtn = document.createElement('button');
                filterBtn.textContent = filter;
                filterBtn.className = 'px-4 py-2 rounded-xl bg-brand-sage text-white mb-2 mr-2 transition-all duration-200 hover:bg-brand-green';
                filterBtn.dataset.filter = filter;
                filterBtn.onclick = () => {
                    // Toggle active state
                    const activeBtn = filtersContainer.querySelector('.bg-brand-green');
                    if (activeBtn) activeBtn.classList.remove('bg-brand-green');
                    filterBtn.classList.add('bg-brand-green');
                    
                    // Reset search term when filter changes
                    searchInput.value = '';
                    applyFiltersAndSearch();
                };
                filtersContainer.appendChild(filterBtn);
            });

            // Add a "Show All" button
            const showAllBtn = document.createElement('button');
            showAllBtn.textContent = window.i18n.get('sections.useCases.showAll', 'Show All');
            showAllBtn.className = 'px-4 py-2 rounded-xl bg-brand-green text-white mb-2 transition-all duration-200 hover:bg-green-700';
            showAllBtn.onclick = () => {
                // Remove active state from other buttons
                const activeBtn = filtersContainer.querySelector('.bg-brand-green');
                if (activeBtn) activeBtn.classList.remove('bg-brand-green');
                showAllBtn.classList.add('bg-brand-green');
                
                // Reset filters
                applyFiltersAndSearch();
            };
            filtersContainer.appendChild(showAllBtn);
        }
    }

    // Search input event listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            applyFiltersAndSearch();
        });
    }

    // Combined filtering and search function
    function applyFiltersAndSearch() {
        if (!useCasesContainer) return;

        const activeButton = filtersContainer.querySelector('.bg-brand-green');
        const isShowAllActive = activeButton && activeButton.textContent === window.i18n.get('sections.useCases.showAll', 'Show All');

        const filteredUseCases = useCases.filter(uc => {
            // Filter by category/user segment if a filter is applied (but not if "Show All" is active)
            const matchesFilter = isShowAllActive || !activeButton || 
                (uc['User Segment']?.includes(activeButton.textContent.trim()) || 
                 uc.Category?.replace(/"/g, '').includes(activeButton.textContent.trim()));
            
            // Search across multiple fields
            const matchesSearch = !searchInput || 
                uc['Use Cases']?.toLowerCase().includes(searchInput.value.toLowerCase().trim()) ||
                uc['Why (Impact)']?.toLowerCase().includes(searchInput.value.toLowerCase().trim()) ||
                uc['User Segment']?.toLowerCase().includes(searchInput.value.toLowerCase().trim()) ||
                uc.Category?.toLowerCase().includes(searchInput.value.toLowerCase().trim());
            
            return matchesFilter && matchesSearch;
        });
        
        populateUseCasesGrid(filteredUseCases);
    }

    function populateUseCasesGrid(casesToPopulate) {
        if (!useCasesContainer) return;

        // Show "No results" message if no use cases match
        if (casesToPopulate.length === 0) {
            const noResultsMessage = document.createElement('div');
            noResultsMessage.className = 'col-span-full text-center text-brand-charcoal';
            noResultsMessage.innerHTML = `
                <p class="text-xl">${window.i18n.get('sections.useCases.noResults.title', 'No use cases found')}</p>
                <p class="text-sm">${window.i18n.get('sections.useCases.noResults.subtitle', 'Try adjusting your search or filter')}</p>
            `;
            useCasesContainer.innerHTML = ''; // Clear previous content
            useCasesContainer.appendChild(noResultsMessage);
            return;
        }

        useCasesContainer.innerHTML = ''; // Clear previous content

        casesToPopulate.forEach(uc => {
            const useCaseCard = document.createElement('div');
            useCaseCard.className = 'bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer';
            useCaseCard.innerHTML = `
                <h3 class="text-xl font-bold text-brand-green mb-2">${uc['Use Cases'] || window.i18n.get('fallbacks.useCase')}</h3>
                <p class="text-brand-charcoal mb-2">${uc['Why (Impact)'] || window.i18n.get('fallbacks.descriptionNotAvailable')}</p>
                <div class="text-sm text-brand-sage">
                    <strong>${window.i18n ? window.i18n.get('modals.useCase.userSegment', 'User Segment') : 'User Segment'}:</strong> ${uc['User Segment'] || window.i18n.get('fallbacks.notSpecified')}
                    <br>
                    <strong>${window.i18n ? window.i18n.get('modals.useCase.category', 'Category') : 'Category'}:</strong> ${uc.Category?.replace(/"/g, '') || window.i18n.get('fallbacks.notSpecified')}
                </div>
            `;
            
            // Add click event to show modal with full details
            useCaseCard.addEventListener('click', () => {
                openModal(uc);
            });
            
            useCasesContainer.appendChild(useCaseCard);
        });
    }

    // Modal elements
    const useCaseModal = document.getElementById('use-case-modal');
    const useCaseModalContent = document.getElementById('use-case-modal-content');
    const closeModalBtn = document.getElementById('close-use-case-modal');

    // Modal utility functions
    function openModal(useCaseDetails) {
        if (useCaseModal && useCaseModalContent) {
            useCaseModalContent.innerHTML = `
                <h2 class="text-3xl font-bold text-brand-green mb-4">${useCaseDetails['Use Cases']}</h2>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-xl font-semibold text-brand-sage mb-2">${window.i18n.get('modals.useCase.impact', 'Impact')}</h3>
                        <p class="text-brand-charcoal mb-4">${useCaseDetails['Why (Impact)']}</p>
                        
                        <h3 class="text-xl font-semibold text-brand-sage mb-2">${window.i18n.get('modals.useCase.userSegment', 'User Segment')}</h3>
                        <p class="text-brand-charcoal mb-4">${useCaseDetails['User Segment']}</p>
                        
                        <h3 class="text-xl font-semibold text-brand-sage mb-2">${window.i18n.get('modals.useCase.category', 'Category')}</h3>
                        <p class="text-brand-charcoal mb-4">${useCaseDetails.Category?.replace(/"/g, '') || window.i18n.get('fallbacks.notSpecified')}</p>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-semibold text-brand-sage mb-2">${window.i18n.get('modals.useCase.features', 'Features')}</h3>
                        <ul class="list-disc list-inside text-brand-charcoal">
                            ${useCaseDetails.Features.split(', ').map(feature => 
                                `<li>${feature}</li>`
                            ).join('')}
                        </ul>
                        
                        <h3 class="text-xl font-semibold text-brand-sage mt-4 mb-2">${window.i18n.get('modals.useCase.workflow', 'Workflow')}</h3>
                        <div class="text-brand-charcoal bg-brand-offwhite p-4 rounded-xl">
                            <p>${useCaseDetails['How (Inputs → AI Workflow → Output)']}</p>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 grid grid-cols-3 gap-4">
                    <div class="bg-brand-offwhite p-4 rounded-xl text-center">
                        <h4 class="font-semibold text-brand-sage">${window.i18n.get('modals.useCase.risk', 'Risk')}</h4>
                        <p class="text-brand-charcoal">${useCaseDetails.Risk || 'N/A'}/5</p>
                    </div>
                    <div class="bg-brand-offwhite p-4 rounded-xl text-center">
                        <h4 class="font-semibold text-brand-sage">${window.i18n.get('modals.useCase.userEffortReduction', 'User Effort Reduction')}</h4>
                        <p class="text-brand-charcoal">${useCaseDetails['User Effort Reduction'] || 'N/A'}/5</p>
                    </div>
                    <div class="bg-brand-offwhite p-4 rounded-xl text-center">
                        <h4 class="font-semibold text-brand-sage">${window.i18n.get('modals.useCase.technicalFeasibility', 'Technical Feasibility')}</h4>
                        <p class="text-brand-charcoal">${useCaseDetails['Technical Feasibility'] || 'N/A'}/5</p>
                    </div>
                </div>
            `;
            
            // Show modal
            if (useCaseModal) {
                useCaseModal.classList.remove('hidden');
                useCaseModal.classList.add('flex');
            }
        }
    }

    function closeModal() {
        if (useCaseModal) {
            useCaseModal.classList.remove('flex');
            useCaseModal.classList.add('hidden');
        }
    }

    // Close modal when clicking outside or on close button
    if (useCaseModal && closeModalBtn) {
        useCaseModal.addEventListener('click', (e) => {
            if (e.target === useCaseModal) {
                closeModal();
            }
        });
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Add Esc key support for closing modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && useCaseModal && !useCaseModal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Newsletter iframe fallback handling
    function initNewsletterFallback() {
        const iframe = document.getElementById('beehiiv-iframe');
        const mobileFallback = document.getElementById('mobile-newsletter-fallback');
        
        if (iframe) {
            // Check if iframe loads successfully
            iframe.addEventListener('load', () => {
                console.log('Beehiiv iframe loaded successfully');
            });
            
            iframe.addEventListener('error', () => {
                console.log('Beehiiv iframe failed to load, showing fallback');
                showNewsletterFallback();
            });
            
            // Fallback for iframe that doesn't load within 5 seconds
            setTimeout(() => {
                if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
                    // Iframe loaded successfully
                    console.log('Iframe loaded within timeout');
                } else {
                    console.log('Iframe timeout, showing fallback');
                    showNewsletterFallback();
                }
            }, 5000);
        }
        
        function showNewsletterFallback() {
            // Only show fallback on mobile devices (screen width < 768px)
            const isMobile = window.innerWidth < 768;
            
            if (isMobile) {
                if (iframe) {
                    iframe.style.display = 'none';
                }
                if (mobileFallback) {
                    mobileFallback.classList.remove('md:hidden');
                    mobileFallback.classList.add('block');
                }
            }
        }
    }
    
    // Initialize newsletter fallback
    initNewsletterFallback();
    
    // Handle window resize for newsletter fallback
    window.addEventListener('resize', () => {
        const iframe = document.getElementById('beehiiv-iframe');
        const mobileFallback = document.getElementById('mobile-newsletter-fallback');
        const isMobile = window.innerWidth < 768;
        
        if (iframe && mobileFallback) {
            if (isMobile) {
                // On mobile: hide iframe, show fallback
                iframe.style.display = 'none';
                mobileFallback.classList.remove('md:hidden');
                mobileFallback.classList.add('block');
            } else {
                // On desktop: show iframe, hide fallback
                iframe.style.display = '';
                mobileFallback.classList.add('md:hidden');
                mobileFallback.classList.remove('block');
            }
        }
    });

    // Initialize the use cases
    createFilterButtons();
    applyFiltersAndSearch();
}

// Function to populate personas from i18n data
function populatePersonas() {
    const personasContainer = document.getElementById('personas-container');
    if (!personasContainer || !window.i18n || !window.i18n.loaded) return;

    const personas = window.i18n.get('data.personas', []);
    
    personasContainer.innerHTML = ''; // Clear existing content
    
    personas.forEach(persona => {
        const personaCard = document.createElement('div');
        personaCard.className = 'bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer';
        personaCard.innerHTML = `
            <div class="text-center">
                <img src="${persona.image}" alt="${persona.name}" class="w-24 h-24 rounded-full mx-auto mb-4 object-cover">
                <h3 class="text-xl font-bold text-brand-green mb-2">${persona.name}</h3>
                <p class="text-brand-sage font-semibold mb-2">${persona.segment}</p>
                <p class="text-sm text-brand-charcoal mb-4">${persona.location}</p>
                <button class="bg-brand-green text-white px-4 py-2 rounded-xl text-sm">
                    ${window.i18n.get('modals.persona.learnMore', 'Learn More')}
                </button>
            </div>
        `;
        
        // Add click event to show persona details
        personaCard.addEventListener('click', () => {
            openPersonaModal(persona);
        });
        
        personasContainer.appendChild(personaCard);
    });
}

// Function to open persona modal
function openPersonaModal(persona) {
    const personaModal = document.getElementById('persona-modal');
    const personaModalContent = document.getElementById('persona-modal-content');
    
    if (personaModal && personaModalContent) {
        personaModalContent.innerHTML = `
            <div class="text-center mb-6">
                <img src="${persona.image}" alt="${persona.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                <h2 class="text-3xl font-bold text-brand-green mb-2">${persona.name}</h2>
                <p class="text-xl text-brand-sage">${persona.segment}</p>
                <p class="text-brand-charcoal">${persona.location}</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-xl font-semibold text-brand-sage mb-3">${window.i18n.get('modals.persona.profile', 'Profile')}</h3>
                    <ul class="space-y-2 text-brand-charcoal">
                        <li><strong>${window.i18n.get('modals.persona.age', 'Age')}:</strong> ${persona.age}</li>
                        <li><strong>${window.i18n.get('modals.persona.technicalLiteracy', 'Technical Literacy')}:</strong> ${persona.technicalLiteracy}</li>
                        ${persona.landSize ? `<li><strong>${window.i18n.get('modals.persona.landSize', 'Land Size')}:</strong> ${persona.landSize}</li>` : ''}
                        ${persona.primaryCrop ? `<li><strong>${window.i18n.get('modals.persona.primaryCrop', 'Primary Crop')}:</strong> ${persona.primaryCrop}</li>` : ''}
                        ${persona.specialization ? `<li><strong>${window.i18n.get('modals.persona.specialization', 'Specialization')}:</strong> ${persona.specialization}</li>` : ''}
                        ${persona.institution ? `<li><strong>${window.i18n.get('modals.persona.institution', 'Institution')}:</strong> ${persona.institution}</li>` : ''}
                        ${persona.organization ? `<li><strong>${window.i18n.get('modals.persona.organization', 'Organization')}:</strong> ${persona.organization}</li>` : ''}
                    </ul>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold text-brand-sage mb-3">${window.i18n.get('modals.persona.challenges', 'Challenges')}</h3>
                    <ul class="list-disc list-inside text-brand-charcoal mb-6">
                        ${persona.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                    </ul>
                    
                    <h3 class="text-xl font-semibold text-brand-sage mb-3">${window.i18n.get('modals.persona.goals', 'Goals')}</h3>
                    <ul class="list-disc list-inside text-brand-charcoal">
                        ${persona.goals.map(goal => `<li>${goal}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="mt-6">
                <h3 class="text-xl font-semibold text-brand-sage mb-3">${window.i18n.get('modals.persona.preferredFeatures', 'Preferred Features')}</h3>
                <div class="flex flex-wrap gap-2">
                    ${persona.preferredFeatures.map(feature => 
                        `<span class="bg-brand-offwhite px-3 py-1 rounded-full text-sm text-brand-charcoal">${feature}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Show modal
        personaModal.classList.remove('hidden');
        personaModal.classList.add('flex');
    }
}

// Language Switcher Functionality
let languageSwitcherInitialized = false;

function initLanguageSwitcher() {
    // Prevent multiple initializations
    if (languageSwitcherInitialized) {
        return;
    }
    
    const languageSwitcher = document.getElementById('language-switcher');
    const languageDropdown = document.getElementById('language-dropdown');
    const currentLanguageSpan = document.getElementById('current-language');
    const languageOptions = document.querySelectorAll('.language-option');

    // Track dropdown state globally for this function
    let isDropdownOpen = false;

    // Update current language display
    function updateLanguageDisplay() {
        if (window.i18n && window.i18n.loaded) {
            const currentLang = window.i18n.getCurrentLanguage();
            const displayNames = window.i18n.getLanguageDisplayNames();
            const displayName = displayNames[currentLang] || currentLang.toUpperCase();
            
            if (currentLanguageSpan) {
                currentLanguageSpan.textContent = currentLang.toUpperCase();
            }
            

        }
    }

    // Toggle dropdown function
    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
        
        if (isDropdownOpen) {
            languageDropdown.classList.remove('hidden');
        } else {
            languageDropdown.classList.add('hidden');
        }
    }
    
    // Close dropdown function
    function closeDropdown() {
        isDropdownOpen = false;
        languageDropdown.classList.add('hidden');
    }

    // Desktop dropdown toggle
    if (languageSwitcher && languageDropdown) {
        // Language switcher click handler
        languageSwitcher.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });

        // Close dropdown when clicking outside
        const handleOutsideClick = (e) => {
            if (isDropdownOpen && !languageSwitcher.contains(e.target) && !languageDropdown.contains(e.target)) {
                closeDropdown();
            }
        };
        
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && isDropdownOpen) {
                closeDropdown();
            }
        };
        
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleEscapeKey);
        
        // Store references for potential cleanup
        languageSwitcher._outsideClickHandler = handleOutsideClick;
        languageSwitcher._escapeKeyHandler = handleEscapeKey;
    }

    // Language option click handlers
    languageOptions.forEach(option => {
        option.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const selectedLang = option.getAttribute('data-lang');
            console.log('Language option clicked:', selectedLang);
            
            if (window.i18n && selectedLang !== window.i18n.getCurrentLanguage()) {
                await window.i18n.changeLanguage(selectedLang);
                updateLanguageDisplay();
                
                // Close dropdown
                closeDropdown();
            }
        });
    });

    // Initial display update
    updateLanguageDisplay();
    
    // Ensure dropdown is hidden on initialization
    if (languageDropdown) {
        languageDropdown.classList.add('hidden');
    }
    
    languageSwitcherInitialized = true;
}

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        let isMobileMenuOpen = false;
        
        function toggleMobileMenu() {
            isMobileMenuOpen = !isMobileMenuOpen;
            
            if (isMobileMenuOpen) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.remove('-translate-y-full');
                mobileMenu.classList.add('translate-y-0');
            } else {
                mobileMenu.classList.add('-translate-y-full');
                mobileMenu.classList.remove('translate-y-0');
                // Add hidden class after animation
                setTimeout(() => {
                    if (!isMobileMenuOpen) {
                        mobileMenu.classList.add('hidden');
                    }
                }, 500);
            }
        }
        
        function closeMobileMenu() {
            if (isMobileMenuOpen) {
                toggleMobileMenu();
            }
        }
        
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });
        
        // Close mobile menu when clicking on navigation links
        const mobileMenuLinks = mobileMenu.querySelectorAll('a[href^="#"]');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Small delay to ensure smooth scrolling works
                setTimeout(() => {
                    closeMobileMenu();
                }, 100);
            });
        });
        
        // Close mobile menu when clicking on buttons
        const mobileMenuButtons = mobileMenu.querySelectorAll('button');
        mobileMenuButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Small delay to ensure button action works
                setTimeout(() => {
                    closeMobileMenu();
                }, 100);
            });
        });
        
        // Close mobile menu when clicking outside
        const handleMobileOutsideClick = (e) => {
            if (isMobileMenuOpen && 
                !mobileMenuToggle.contains(e.target) && 
                !mobileMenu.contains(e.target)) {
                toggleMobileMenu();
            }
        };
        
        const handleMobileEscapeKey = (e) => {
            if (e.key === 'Escape' && isMobileMenuOpen) {
                toggleMobileMenu();
            }
        };
        
        document.addEventListener('click', handleMobileOutsideClick);
        document.addEventListener('keydown', handleMobileEscapeKey);
        
        // Store references for potential cleanup
        mobileMenuToggle._outsideClickHandler = handleMobileOutsideClick;
        mobileMenuToggle._escapeKeyHandler = handleMobileEscapeKey;
    }
}

// Initialize when DOM is loaded and i18n is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu immediately (doesn't depend on i18n)
    initMobileMenu();
    
    // Wait for i18n to be loaded
    const initApp = () => {
        if (window.i18n && window.i18n.loaded) {
            populateCapabilities();
            populateUseCases();
            populatePersonas();
            initLanguageSwitcher();
        } else {
            // If i18n is not ready yet, wait a bit and try again
            setTimeout(initApp, 100);
        }
    };
    
    // Also listen for the i18n ready event
    window.addEventListener('i18nReady', () => {
        populateCapabilities();
        populateUseCases();
        populatePersonas();
        initLanguageSwitcher();
    });
    
    initApp();
});

// Listen for language changes
window.addEventListener('languageChanged', () => {
    populateCapabilities();
    populateUseCases();
    populatePersonas();
    
    // Update language switcher display
    const currentLanguageSpan = document.getElementById('current-language');
    if (currentLanguageSpan && window.i18n) {
        currentLanguageSpan.textContent = window.i18n.getCurrentLanguage().toUpperCase();
    }
    

});

// Persona Modal Close Functionality
const personaModal = document.getElementById('persona-modal');
const closePersonaModalBtn = document.getElementById('close-persona-modal');

function closePersonaModal() {
    if (personaModal) {
        personaModal.classList.remove('flex');
        personaModal.classList.add('hidden');
    }
}

// Close modal when clicking outside or on close button
if (personaModal) {
    personaModal.addEventListener('click', (e) => {
        if (e.target === personaModal) {
            closePersonaModal();
        }
    });
}

if (closePersonaModalBtn) {
    closePersonaModalBtn.addEventListener('click', closePersonaModal);
}

// Add Esc key support for closing persona modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && personaModal && !personaModal.classList.contains('hidden')) {
        closePersonaModal();
    }
});

// Cookie Banner Functionality
function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const cookiePreferences = document.getElementById('cookie-preferences');
    const acceptAllBtn = document.getElementById('accept-all');
    const rejectBtn = document.getElementById('reject');
    const customizeBtn = document.getElementById('customize');
    const savePreferencesBtn = document.getElementById('save-preferences');
    const closePreferencesBtn = document.getElementById('close-preferences');
    const analyticsCheckbox = document.getElementById('analytics-cookies');
    const marketingCheckbox = document.getElementById('marketing-cookies');

    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    
    if (!cookieConsent && cookieBanner) {
        // Show banner after a short delay
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }

    // Accept all cookies
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', JSON.stringify({
                necessary: true,
                analytics: true,
                marketing: true,
                timestamp: Date.now()
            }));
            cookieBanner.classList.remove('show');
        });
    }

    // Reject non-essential cookies
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', JSON.stringify({
                necessary: true,
                analytics: false,
                marketing: false,
                timestamp: Date.now()
            }));
            cookieBanner.classList.remove('show');
        });
    }

    // Open preferences modal
    if (customizeBtn) {
        customizeBtn.addEventListener('click', () => {
            cookiePreferences.classList.add('show');
            // Set current preferences
            const currentConsent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');
            if (analyticsCheckbox) analyticsCheckbox.checked = currentConsent.analytics || false;
            if (marketingCheckbox) marketingCheckbox.checked = currentConsent.marketing || false;
        });
    }

    // Save preferences
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', () => {
            const preferences = {
                necessary: true,
                analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
                marketing: marketingCheckbox ? marketingCheckbox.checked : false,
                timestamp: Date.now()
            };
            localStorage.setItem('cookieConsent', JSON.stringify(preferences));
            cookiePreferences.classList.remove('show');
            cookieBanner.classList.remove('show');
        });
    }

    // Close preferences modal
    if (closePreferencesBtn) {
        closePreferencesBtn.addEventListener('click', () => {
            cookiePreferences.classList.remove('show');
        });
    }

    // Close modal when clicking outside
    if (cookiePreferences) {
        cookiePreferences.addEventListener('click', (e) => {
            if (e.target === cookiePreferences) {
                cookiePreferences.classList.remove('show');
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cookiePreferences && cookiePreferences.classList.contains('show')) {
            cookiePreferences.classList.remove('show');
        }
    });
}

// Initialize cookie banner
initCookieBanner(); 