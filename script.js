// Loading Animation
document.addEventListener('DOMContentLoaded', function() {
    // Check if elements exist before trying to use them
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        // Hide loading animation after page is loaded
        setTimeout(function() {
            loadingElement.style.display = 'none';
        }, 1500);
    }
    
    // Scroll to Top Button
    const scrollToTopButton = document.getElementById('scroll-to-top');
    if (scrollToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopButton.style.display = 'block';
            } else {
                scrollToTopButton.style.display = 'none';
            }
        });
        
        scrollToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a');
    if (navLinks.length > 0) {
        navLinks.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Neural Network Background
    const initCanvas = function() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return; // Exit if canvas doesn't exist
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return; // Exit if context can't be obtained
        
        // DOM elements for UI controls
        const toggleAnimationBtn = document.getElementById('toggle-animation');
        const motionIntensitySelect = document.getElementById('motion-intensity');
        const colorSchemeSelect = document.getElementById('color-scheme');
        
        // Configuration settings
        let config = {
            particleCount: 100,
            particleSize: { min: 1, max: 3 },
            particleSpeed: { min: 0.2, max: 0.5 },
            lineThreshold: 150,
            lineOpacity: 0.2,
            cursorInfluence: 150,
            cursorForce: 0.5,
            animated: true,
            glitchInterval: 5000,
            colors: {
                blue: ['#0a84ff', '#64d5ff', '#5a91e3', '#1f4287'],
                purple: ['#a742f5', '#8c52ff', '#b14cf3', '#6a11cb'],
                teal: ['#00e6b3', '#00c3c1', '#00a6b8', '#008c9e'],
                multi: ['#0a84ff', '#a742f5', '#00e6b3', '#ffb300']
            },
            backgroundColor: '#0a0e17'
        };
        
        // Dynamic configuration based on motion intensity
        const motionSettings = {
            high: {
                particleSpeed: { min: 0.3, max: 0.7 },
                cursorForce: 1.0
            },
            medium: {
                particleSpeed: { min: 0.2, max: 0.5 },
                cursorForce: 0.5
            },
            low: {
                particleSpeed: { min: 0.1, max: 0.3 },
                cursorForce: 0.3
            },
            minimal: {
                particleSpeed: { min: 0.05, max: 0.1 },
                cursorForce: 0.1
            }
        };
        
        // Animation state
        let animationId;
        let particles = [];
        let mousePosition = { x: null, y: null };
        let colorScheme = 'blue';
        let lastTime = 0;
        let glitchTimeout;
        
        // Helper functions
        function random(min, max) {
            return Math.random() * (max - min) + min;
        }
        
        function distance(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }
        
        function updateCanvasSize() {
            if (!canvas) return;
            
            canvas.width = window.innerWidth || document.documentElement.clientWidth || 1200;
            canvas.height = window.innerHeight || document.documentElement.clientHeight || 800;
            
            // Adjust particle count based on screen size
            config.particleCount = Math.min(Math.max(30, Math.floor(canvas.width * canvas.height / 10000)), 150);
            initParticles();
        }
        
        // Particle class
        class Particle {
            constructor() {
                this.init();
            }
            
            init() {
                this.x = random(0, canvas.width);
                this.y = random(0, canvas.height);
                this.size = random(config.particleSize.min, config.particleSize.max);
                this.speedX = random(-config.particleSpeed.max, config.particleSpeed.max);
                this.speedY = random(-config.particleSpeed.max, config.particleSpeed.max);
                this.colorIndex = Math.floor(random(0, config.colors[colorScheme].length));
                this.pulse = 0;
                this.pulseSpeed = random(0.02, 0.04);
            }
            
            update() {
                if (!config.animated) return;
                
                // Update position
                this.x += this.speedX;
                this.y += this.speedY;
                
                // Handle boundary collision
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
                
                // Handle cursor interaction
                if (mousePosition.x !== null && mousePosition.y !== null) {
                    const dist = distance(this.x, this.y, mousePosition.x, mousePosition.y);
                    if (dist < config.cursorInfluence) {
                        const angle = Math.atan2(this.y - mousePosition.y, this.x - mousePosition.x);
                        const force = (config.cursorInfluence - dist) / config.cursorInfluence * config.cursorForce;
                        this.speedX += Math.cos(angle) * force;
                        this.speedY += Math.sin(angle) * force;
                    }
                }
                
                // Limit speed
                const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
                if (speed > config.particleSpeed.max * 1.5) {
                    this.speedX = (this.speedX / speed) * config.particleSpeed.max * 1.5;
                    this.speedY = (this.speedY / speed) * config.particleSpeed.max * 1.5;
                }
                
                // Pulse effect
                this.pulse += this.pulseSpeed;
                if (this.pulse > Math.PI * 2) this.pulse = 0;
            }
            
            draw() {
                if (!ctx) return;
                
                const pulseSize = this.size * (1 + 0.2 * Math.sin(this.pulse));
                const color = config.colors[colorScheme][this.colorIndex];
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                
                // Add glow effect
                ctx.beginPath();
                ctx.arc(this.x, this.y, pulseSize * 2, 0, Math.PI * 2);
                
                try {
                    const gradient = ctx.createRadialGradient(
                        this.x, this.y, pulseSize,
                        this.x, this.y, pulseSize * 2
                    );
                    gradient.addColorStop(0, color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
                    gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
                    ctx.fillStyle = gradient;
                    ctx.fill();
                } catch (e) {
                    // Fallback if gradient creation fails
                    ctx.fillStyle = color.replace(')', ', 0.1)').replace('rgb', 'rgba');
                    ctx.fill();
                }
            }
        }
        
        // Initialize particles
        function initParticles() {
            particles = [];
            for (let i = 0; i < config.particleCount; i++) {
                particles.push(new Particle());
            }
        }
        
        // Draw connections between particles
        function drawConnections() {
            if (!ctx) return;
            
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = distance(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                    
                    if (dist < config.lineThreshold) {
                        // Calculate opacity based on distance
                        const opacity = (1 - dist / config.lineThreshold) * config.lineOpacity;
                        
                        // Draw line
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        
                        // Apply color from either particle with opacity
                        const color = config.colors[colorScheme][particles[i].colorIndex];
                        ctx.strokeStyle = color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
        }
        
        // Create glitch effect
        function createGlitch() {
            clearTimeout(glitchTimeout);
            
            for (let i = 0; i < particles.length; i++) {
                if (Math.random() < 0.3) {
                    particles[i].speedX = random(-config.particleSpeed.max * 2, config.particleSpeed.max * 2);
                    particles[i].speedY = random(-config.particleSpeed.max * 2, config.particleSpeed.max * 2);
                }
            }
            
            // Schedule next glitch
            glitchTimeout = setTimeout(createGlitch, random(config.glitchInterval * 0.5, config.glitchInterval * 1.5));
        }
        
        // Main animation loop
        function animate(timestamp) {
            if (!ctx || !canvas) {
                cancelAnimationFrame(animationId);
                return;
            }
            
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;
            lastTime = timestamp;
            
            // Clear canvas
            ctx.fillStyle = config.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            // Draw connections
            drawConnections();
            
            // Request next frame
            animationId = requestAnimationFrame(animate);
        }
        
        // Initialize
        function init() {
            updateCanvasSize();
            
            // Start animation
            if (config.animated) {
                animationId = requestAnimationFrame(animate);
            }
            
            // Start glitch effect
            glitchTimeout = setTimeout(createGlitch, config.glitchInterval);
            
            // Listen for mouse movement
            if (canvas) {
                canvas.addEventListener('mousemove', function(e) {
                    mousePosition.x = e.clientX;
                    mousePosition.y = e.clientY;
                });
                
                // Listen for mouse leave
                canvas.addEventListener('mouseleave', function() {
                    mousePosition.x = null;
                    mousePosition.y = null;
                });
            }
            
            // Listen for window resize
            window.addEventListener('resize', updateCanvasSize);
            
            // Set up UI controls
            if (toggleAnimationBtn) {
                toggleAnimationBtn.addEventListener('click', function() {
                    config.animated = !config.animated;
                    toggleAnimationBtn.textContent = config.animated ? 'Pause Animation' : 'Resume Animation';
                    
                    if (config.animated) {
                        lastTime = 0;
                        animationId = requestAnimationFrame(animate);
                    } else {
                        cancelAnimationFrame(animationId);
                    }
                });
            }
            
            if (motionIntensitySelect) {
                motionIntensitySelect.addEventListener('change', function() {
                    const intensity = motionIntensitySelect.value;
                    if (motionSettings[intensity]) {
                        config.particleSpeed = motionSettings[intensity].particleSpeed;
                        config.cursorForce = motionSettings[intensity].cursorForce;
                        
                        particles.forEach(particle => {
                            particle.speedX = random(-config.particleSpeed.max, config.particleSpeed.max);
                            particle.speedY = random(-config.particleSpeed.max, config.particleSpeed.max);
                        });
                    }
                });
            }
            
            if (colorSchemeSelect) {
                colorSchemeSelect.addEventListener('change', function() {
                    colorScheme = colorSchemeSelect.value;
                    particles.forEach(particle => {
                        particle.colorIndex = Math.floor(random(0, config.colors[colorScheme].length));
                    });
                });
            }
        }
        
        // Start initialization
        try {
            init();
        } catch (error) {
            console.error("Error initializing canvas animation:", error);
        }
    };
    
    // Try to initialize the canvas
    try {
        initCanvas();
    } catch (error) {
        console.error("Error in canvas initialization:", error);
    }
});