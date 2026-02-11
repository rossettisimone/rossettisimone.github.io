// Parallax Background Scrolling Effect with Delay
class ParallaxBackground {
    constructor() {
        this.scrollSpeed = 0.8; // Background moves at 80% of scroll speed
        this.delay = 0.1; // Delay factor for smooth movement
        this.currentY = 0;
        this.targetY = 0;
        this.isAnimating = false;
        this.init();
    }

    init() {
        // Add scroll event listener
        window.addEventListener('scroll', () => {
            this.updateTargetPosition();
        });

        // Start animation loop
        this.animate();

        // Initial position
        this.updateTargetPosition();

        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateTargetPosition();
        });
    }

    updateTargetPosition() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        this.targetY = scrollY * this.scrollSpeed;
    }

    animate() {
        // Smooth interpolation between current and target position
        const diff = this.targetY - this.currentY;
        this.currentY += diff * this.delay;
        
        // Apply the parallax effect to the body background
        document.body.style.backgroundPosition = `center ${this.currentY}px`;
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }

    // Method to change scroll speed
    setScrollSpeed(speed) {
        this.scrollSpeed = speed;
        this.updateTargetPosition();
    }

    // Method to change delay (higher = smoother but slower)
    setDelay(delay) {
        this.delay = Math.max(0.01, Math.min(0.5, delay)); // Clamp between 0.01 and 0.5
    }
}

// Initialize parallax when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.parallaxBackground = new ParallaxBackground();
});
