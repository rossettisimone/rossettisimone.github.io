// Advanced Features for Cabbo AI Agricultural Platform

// Initialize features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to "Request Early Access" buttons
    const earlyAccessButtons = document.querySelectorAll('button[data-action="request-early-access"]');
    earlyAccessButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newsletterSection = document.getElementById('newsletter');
            if (newsletterSection) {
                newsletterSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add event listener to "Answer Our Survey" button
    const surveyButtons = document.querySelectorAll('button[data-action="answer-survey"]');
    surveyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Option 1: Direct redirect to Google Form (current implementation)
            // window.open('https://docs.google.com/forms/d/e/1FAIpQLSfvG9EJTo6Ckd9bbp9277j09EvxILC7Q-P8io0Y7vpw4HS0nA/viewform?usp=dialog', '_blank');
            
            // Option 2: Uncomment the line below to use embedded survey modal instead
            showSurveyModal();
        });
    });
    
    // Add event listener to "See Use Cases" button
    const seeUseCasesButtons = document.querySelectorAll('button[data-action="see-use-cases"]');
    seeUseCasesButtons.forEach(button => {
        button.addEventListener('click', () => {
            const useCasesSection = document.getElementById('use-cases');
            if (useCasesSection) {
                useCasesSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Analytics and Event Tracking
function initAnalytics() {
    // Basic event tracking
    const trackEvent = (eventName, eventData = {}) => {
        console.log(`Event: ${eventName}`, eventData);
        
        // TODO: Integrate with actual analytics service
        // Example with Google Analytics or similar
        // window.gtag('event', eventName, eventData);
    };

    // Track button clicks
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('button_click', {
                buttonText: button.textContent.trim(),
                timestamp: new Date().toISOString()
            });
        });
    });

    // Track form interactions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            const formData = new FormData(form);
            const submissionData = Object.fromEntries(formData.entries());
            
            trackEvent('form_submission', {
                formId: form.id,
                formType: form.getAttribute('data-form-type') || 'unknown',
                timestamp: new Date().toISOString()
            });
        });
    });
}



// Comprehensive Research Survey Modal
function createComprehensiveResearchSurvey() {
    const surveyModal = document.createElement('div');
    surveyModal.id = 'research-survey-modal';
    surveyModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center';
    surveyModal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <button id="close-research-survey-modal" class="absolute top-4 right-4 text-2xl text-brand-charcoal hover:text-brand-green transition-colors">
                &times;
            </button>
            <h2 class="text-2xl font-bold text-brand-green mb-6">AI in Agriculture: Research Survey</h2>
            
            <form id="comprehensive-research-survey" data-form-type="research-survey">
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-xl font-semibold text-brand-sage mb-4">Personal Information</h3>
                        <div class="mb-4">
                            <label class="block mb-2 text-brand-charcoal">Name</label>
                            <input type="text" name="name" 
                                class="w-full px-4 py-2 border border-brand-sage rounded-xl" 
                                placeholder="Your full name" required>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-2 text-brand-charcoal">Email</label>
                            <input type="email" name="email" 
                                class="w-full px-4 py-2 border border-brand-sage rounded-xl" 
                                placeholder="Your email address" required>
                        </div>
                        <div class="mb-4">
                            <label class="block mb-2 text-brand-charcoal">Professional Role</label>
                            <select name="role" 
                                class="w-full px-4 py-2 border border-brand-sage rounded-xl" required>
                                <option value="">Select your role</option>
                                <option value="farmer">Farmer</option>
                                <option value="researcher">Agricultural Researcher</option>
                                <option value="consultant">Agricultural Consultant</option>
                                <option value="student">Student</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-semibold text-brand-sage mb-4">AI Insights</h3>
                        <div class="mb-4">
                            <label class="block mb-2 text-brand-charcoal">AI Familiarity Level</label>
                            <div class="flex space-x-4">
                                ${['Not Familiar', 'Somewhat Familiar', 'Very Familiar'].map((level, index) => `
                                    <label class="inline-flex items-center">
                                        <input type="radio" name="ai-familiarity" 
                                            value="${level.toLowerCase().replace(' ', '-')}" 
                                            class="form-radio text-brand-green" required>
                                        <span class="ml-2">${level}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block mb-2 text-brand-charcoal">Key Agricultural Challenges</label>
                            <textarea name="challenges" 
                                class="w-full px-4 py-2 border border-brand-sage rounded-xl" 
                                rows="4" 
                                placeholder="Describe the main challenges you face in agriculture" required></textarea>
                        </div>
                        
                        <div class="mb-4">
                            <label class="block mb-2 text-brand-charcoal">AI Solution Interest</label>
                            <div class="flex items-center space-x-4">
                                <span>Low</span>
                                ${[1,2,3,4,5].map(num => `
                                    <label class="inline-flex items-center">
                                        <input type="radio" name="ai-interest" 
                                            value="${num}" 
                                            class="form-radio text-brand-green" required>
                                        <span class="ml-1">${num}</span>
                                    </label>
                                `).join('')}
                                <span>High</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6">
                    <button type="submit" 
                        class="w-full bg-brand-green text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors">
                        Submit Research Insights
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(surveyModal);
    
    const modal = document.getElementById('research-survey-modal');
    const closeModalBtn = document.getElementById('close-research-survey-modal');
    const form = document.getElementById('comprehensive-research-survey');
    
    // Close modal functionality
    const closeModal = () => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    };
    
    closeModalBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const submissionData = Object.fromEntries(formData.entries());
        // Send to Formspree
        const formDataForFormspree = new FormData();
        formDataForFormspree.append('name', submissionData.name);
        formDataForFormspree.append('email', submissionData.email);
        formDataForFormspree.append('role', submissionData.role);
        formDataForFormspree.append('ai-familiarity', submissionData['ai-familiarity']);
        formDataForFormspree.append('challenges', submissionData.challenges);
        formDataForFormspree.append('ai-interest', submissionData['ai-interest']);
        formDataForFormspree.append('type', 'research-survey');
        
        try {
            
            const response = await fetch('https://formspree.io/f/mpwlvgyy', {
                method: 'POST',
                body: formDataForFormspree,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success handling
                form.innerHTML = `
                    <div class="text-center">
                        <h3 class="text-2xl font-bold text-brand-green mb-4">Thank You!</h3>
                        <p class="text-brand-charcoal mb-6">
                            Your insights have been sent to our team and are valuable in shaping the future of AI in agriculture.
                        </p>
                        <button onclick="document.getElementById('research-survey-modal').classList.add('hidden')" 
                            class="bg-brand-green text-white px-6 py-3 rounded-xl">
                            Close
                        </button>
                    </div>
                `;
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            // Fallback to email method
            const emailBody = `AI in Agriculture Research Survey Response:
            
Name: ${submissionData.name || 'N/A'}
Email: ${submissionData.email || 'N/A'}
Role: ${submissionData.role || 'N/A'}
AI Familiarity: ${submissionData['ai-familiarity'] || 'N/A'}
Challenges: ${submissionData.challenges || 'N/A'}
AI Interest: ${submissionData['ai-interest'] || 'N/A'}/5

Submitted at: ${new Date().toLocaleString()}`;

            const mailtoLink = `mailto:support@example.com?subject=Research Survey Response - AI in Agriculture&body=${encodeURIComponent(emailBody)}`;
            window.open(mailtoLink);
            
            // Show success message with email fallback
            form.innerHTML = `
                <div class="text-center">
                    <h3 class="text-2xl font-bold text-brand-green mb-4">Thank You!</h3>
                    <p class="text-brand-charcoal mb-6">
                        Your insights have been sent via email and are valuable in shaping the future of AI in agriculture.
                    </p>
                    <button onclick="document.getElementById('research-survey-modal').classList.add('hidden')" 
                        class="bg-brand-green text-white px-6 py-3 rounded-xl">
                        Close
                    </button>
                </div>
            `;
        }
    });
}

// Accessibility Enhancements
function enhanceAccessibility() {
    // Add ARIA labels to buttons
    document.querySelectorAll('button:not([aria-label])').forEach(button => {
        button.setAttribute('aria-label', button.textContent.trim());
    });

    // Improve keyboard navigation
    document.addEventListener('keydown', (e) => {
        // ESC key to close modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.fixed.flex');
            openModals.forEach(modal => {
                modal.classList.remove('flex');
                modal.classList.add('hidden');
            });
        }
    });
}

// Lazy Loading Images
function implementLazyLoading() {
    const images = document.querySelectorAll('img');
    
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
        });
    } else {
        // Fallback to IntersectionObserver
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            if (img.dataset.src) {
                observer.observe(img);
            }
        });
    }
}

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

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up analytics
    initAnalytics();
    
    // Enhance accessibility
    enhanceAccessibility();
    
    // Implement lazy loading
    implementLazyLoading();
    
    // Add event listeners for "Request Early Access" buttons (scroll to newsletter)
    const earlyAccessButtons = document.querySelectorAll('button[data-action="request-early-access"]');
    earlyAccessButtons.forEach(button => {
        button.addEventListener('click', () => {
            const newsletterSection = document.getElementById('newsletter');
            if (newsletterSection) {
                newsletterSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });


    // const researchSurveyLinks = document.querySelectorAll('button[data-action="answer-survey"]');
    // researchSurveyLinks.forEach(link => {
    //     link.addEventListener('click', (e) => {
    //         e.preventDefault();
    //         createComprehensiveResearchSurvey();
    //         const modal = document.getElementById('research-survey-modal');
    //         modal.classList.remove('hidden');
    //         modal.classList.add('flex');
    //     });
    // });
});

// Visually appealing embedded survey modal
function showSurveyModal() {
    // Remove existing modal if it exists
    const existingModal = document.getElementById('survey-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Get i18n instance and translations
    const i18n = window.i18n;
    const t = (key) => i18n ? i18n.get(`modals.survey.${key}`, key) : key;
    
    const modal = document.createElement('div');
    modal.id = 'survey-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-6xl w-full h-[95vh] flex flex-col relative shadow-2xl">
            <!-- Header - Fixed -->
            <div class="bg-gradient-to-r from-brand-green to-green-600 text-white p-4 md:p-6 flex-shrink-0">
                <button id="close-survey-modal" class="absolute top-4 right-4 text-2xl hover:text-green-200 transition-colors z-10">
                    &times;
                </button>
                <h2 class="text-xl md:text-2xl font-bold mb-1 md:mb-2 pr-8">${t('title')}</h2>
                <p class="text-green-100 text-sm md:text-base">${t('subtitle')}</p>
            </div>
            
            <!-- Content - Scrollable -->
            <div class="flex-1 overflow-y-auto p-4 md:p-6">
                <!-- Initial Options View -->
                <div id="survey-options-view">
                    <div class="text-center mb-6">
                        <div class="w-12 h-12 md:w-16 md:h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg md:text-xl font-semibold text-brand-charcoal mb-2">${t('quickSurvey')}</h3>
                        <p class="text-brand-charcoal text-sm md:text-base">${t('description')}</p>
                    </div>
                    
                    <!-- Survey Options -->
                    <div class="space-y-4 mb-6">
                        <div class="bg-brand-offwhite rounded-xl p-4 border-l-4 border-brand-green">
                            <h4 class="font-semibold text-brand-charcoal mb-2">${t('option1Title')}</h4>
                            <p class="text-sm text-brand-charcoal mb-3">${t('option1Description')}</p>
                            <button id="open-survey-tab" class="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                ${t('option1Button')}
                            </button>
                        </div>
                        
                        <div class="bg-brand-offwhite rounded-xl p-4 border-l-4 border-brand-sage">
                            <h4 class="font-semibold text-brand-charcoal mb-2">${t('option2Title')}</h4>
                            <p class="text-sm text-brand-charcoal mb-3">${t('option2Description')}</p>
                            <button id="embed-survey" class="bg-brand-sage text-white px-4 py-2 rounded-lg hover:bg-sage-700 transition-colors">
                                ${t('option2Button')}
                            </button>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="text-center text-sm text-brand-charcoal">
                        <p>${t('footer')}</p>
                    </div>
                </div>
                
                <!-- Embedded Survey View (initially hidden) -->
                <div id="embedded-survey-view" class="hidden h-full flex flex-col">
                    <!-- Survey Header -->
                    <div class="bg-brand-offwhite rounded-xl p-4 mb-4 flex-shrink-0">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-semibold text-brand-charcoal">${t('surveyTitle')}</h3>
                                <p class="text-sm text-brand-charcoal">${t('surveyInstructions')}</p>
                            </div>
                            <button id="back-to-options" class="bg-brand-sage text-white px-3 py-1 rounded-lg hover:bg-sage-700 transition-colors text-sm">
                                ${t('backButton')}
                            </button>
                        </div>
                    </div>
                    
                    <!-- Survey Container - Takes remaining space -->
                    <div class="flex-1 bg-gray-50 rounded-xl p-2 md:p-4 min-h-0">
                        <iframe 
                            id="survey-iframe"
                            src="https://docs.google.com/forms/d/e/1FAIpQLSfvG9EJTo6Ckd9bbp9277j09EvxILC7Q-P8io0Y7vpw4HS0nA/viewform?embedded=true" 
                            class="w-full h-full rounded-lg"
                            frameborder="0" 
                            marginheight="0" 
                            marginwidth="0"
                            style="min-height: 500px;">
                            Loading…
                        </iframe>
                    </div>
                    
                    <!-- Survey Footer -->
                    <div class="bg-brand-offwhite rounded-xl p-4 mt-4 flex-shrink-0">
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div class="text-sm text-brand-charcoal">
                                <p>${t('tip')}</p>
                            </div>
                            <div class="flex gap-2">
                                <button id="open-survey-tab-alt" class="bg-brand-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                                    ${t('openInNewTab')}
                                </button>
                                <button id="close-survey-modal-alt" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm">
                                    ${t('close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('close-survey-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('close-survey-modal-alt').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('open-survey-tab').addEventListener('click', () => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSfvG9EJTo6Ckd9bbp9277j09EvxILC7Q-P8io0Y7vpw4HS0nA/viewform?usp=dialog', '_blank');
        modal.remove();
    });
    
    document.getElementById('open-survey-tab-alt').addEventListener('click', () => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSfvG9EJTo6Ckd9bbp9277j09EvxILC7Q-P8io0Y7vpw4HS0nA/viewform?usp=dialog', '_blank');
        modal.remove();
    });
    
    document.getElementById('embed-survey').addEventListener('click', () => {
        document.getElementById('survey-options-view').classList.add('hidden');
        document.getElementById('embedded-survey-view').classList.remove('hidden');
        
        // Focus the iframe for better accessibility
        setTimeout(() => {
            const iframe = document.getElementById('survey-iframe');
            if (iframe) {
                iframe.focus();
            }
        }, 100);
    });
    
    document.getElementById('back-to-options').addEventListener('click', () => {
        document.getElementById('embedded-survey-view').classList.add('hidden');
        document.getElementById('survey-options-view').classList.remove('hidden');
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Handle iframe load event for better UX
    const iframe = document.getElementById('survey-iframe');
    if (iframe) {
        iframe.addEventListener('load', () => {
            // Add a subtle loading indicator removal
            iframe.style.opacity = '1';
        });
        
        // Set initial opacity for smooth loading
        iframe.style.opacity = '0.8';
        iframe.style.transition = 'opacity 0.3s ease';
    }
}

// Export functions for potential external use
window.Cabbo = {
    createResearchSurvey: createComprehensiveResearchSurvey,
    showSurveyModal: showSurveyModal
}; 