// ============================================
// 🚀 VIDA PREMIUM - JAVASCRIPT PRINCIPAL
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    initSpotsCounter();
    initScrollAnimations();
    initCounters();
    initParticles();
    initSmoothScroll();
    initMobileMenu();
});

// ============================================
// ⏰ CONTADOR REGRESSIVO DE URGÊNCIA
// ============================================

function initCountdown() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (!hoursEl || !minutesEl || !secondsEl) return;
    
    // Define o tempo final (23h59min59s do dia atual)
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endTime - now;
        
        if (distance < 0) {
            // Reinicia para o próximo dia
            endTime.setDate(endTime.getDate() + 1);
            return;
        }
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ============================================
// 🔥 CONTADOR DE VAGAS DISPONÍVEIS
// ============================================

function initSpotsCounter() {
    const spotsEl = document.getElementById('spots');
    
    if (!spotsEl) return;
    
    let spots = 7;
    const minSpots = 3;
    
    // Reduz as vagas aleatoriamente
    setInterval(() => {
        if (spots > minSpots && Math.random() > 0.7) {
            spots--;
            spotsEl.textContent = spots;
            
            // Adiciona animação de atenção
            spotsEl.parentElement.classList.add('flash');
            setTimeout(() => {
                spotsEl.parentElement.classList.remove('flash');
            }, 500);
        }
    }, 15000); // A cada 15 segundos
}

// ============================================
// 📊 ANIMAÇÃO DE CONTADORES NUMÉRICOS
// ============================================

function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000; // 2 segundos
                const increment = target / (duration / 16); // 60 FPS
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.floor(current).toLocaleString('pt-BR');
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString('pt-BR');
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// ✨ ANIMAÇÕES NO SCROLL
// ============================================

function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll, .reveal');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible', 'active');
            }
        });
    }, observerOptions);
    
    elements.forEach(el => observer.observe(el));
}

// ============================================
// 🎨 SISTEMA DE PARTÍCULAS NO HERO
// ============================================

function initParticles() {
    const particlesContainer = document.getElementById('particles');
    
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 6 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float-up-down ${Math.random() * 10 + 5}s infinite ease-in-out`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// ============================================
// 🔗 SCROLL SUAVE
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || href === '') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            
            if (target) {
                const headerHeight = 120; // Altura do header fixo
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// 📱 MENU MOBILE
// ============================================

function initMobileMenu() {
    // TODO: Implementar menu mobile quando necessário
    // Por enquanto, o menu está oculto em dispositivos móveis
}

// ============================================
// 📋 VALIDAÇÃO E MÁSCARA DE FORMULÁRIOS
// ============================================

// Máscara de telefone
function maskPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    
    input.value = value;
}

// Máscara de CPF
function maskCPF(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value;
}

// Máscara de data
function maskDate(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '$1/$2');
    value = value.replace(/(\d{2})(\d)/, '$1/$2');
    input.value = value;
}

// Aplicar máscaras automaticamente
document.addEventListener('input', (e) => {
    const input = e.target;
    
    if (input.name === 'phone' || input.type === 'tel') {
        maskPhone(input);
    }
    
    if (input.name === 'cpf') {
        maskCPF(input);
    }
    
    if (input.name === 'birthDate' && input.type === 'text') {
        maskDate(input);
    }
});

// ============================================
// 🎯 TRACKING E ANALYTICS
// ============================================

function trackEvent(category, action, label) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', action, { category, label });
    }
    
    console.log('Event tracked:', category, action, label);
}

// ============================================
// 💾 ARMAZENAMENTO LOCAL
// ============================================

const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }
};

// ============================================
// 🔔 NOTIFICAÇÕES
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? '#00E676' : type === 'error' ? '#FF1744' : '#0066FF'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.4s ease, slideOutRight 0.4s ease 3s forwards;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3500);
}

// ============================================
// 📞 INTEGRAÇÃO WHATSAPP
// ============================================

function openWhatsApp(message = '') {
    const phone = '5511999999999'; // Substitua pelo número real
    const defaultMessage = message || 'Olá! Gostaria de saber mais sobre os planos de saúde.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;
    
    window.open(url, '_blank');
    trackEvent('Contact', 'WhatsApp', 'Click');
}

// ============================================
// 🎬 LOADING SCREEN
// ============================================

function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.innerHTML = `
        <div class="spinner"></div>
        <p>Carregando...</p>
    `;
    
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(26, 26, 46, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        z-index: 99999;
        color: white;
        font-size: 1.2rem;
        font-weight: 600;
    `;
    
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => loading.remove(), 300);
    }
}

// ============================================
// 🔒 VALIDAÇÃO DE EMAIL
// ============================================

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ============================================
// 📞 VALIDAÇÃO DE TELEFONE
// ============================================

function isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
}

// ============================================
// 🆔 VALIDAÇÃO DE CPF
// ============================================

function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// ============================================
// 🎯 UTILITÁRIOS GERAIS
// ============================================

// Debounce function para otimizar eventos
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function para otimizar eventos
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Exportar funções globais
window.VidaPremium = {
    trackEvent,
    showNotification,
    openWhatsApp,
    showLoading,
    hideLoading,
    isValidEmail,
    isValidPhone,
    isValidCPF,
    storage,
    debounce,
    throttle
};