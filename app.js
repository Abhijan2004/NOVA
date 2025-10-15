const API_BASE_URL = 'https://nova-production-0884.up.railway.app';
  // Configuration
  // Adjust to your backend URL
    let currentUser = null;
    let authToken = null;
    let currentEditingId = null;

    // DOM Elements
    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const journalForm = document.getElementById('journal-form');
    const entryForm = document.getElementById('entry-form');
    const entriesContainer = document.getElementById('entries-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const weatherInfo = document.getElementById('weather-info');
    const weatherDisplay = document.getElementById('weather-display');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');

    // Utility Functions
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    function createAuthHeader() {
        if (currentUser && currentUser.password) {
            const credentials = btoa(`${currentUser.userName}:${currentUser.password}`);
            return { 'Authorization': `Basic ${credentials}` };
        }
        return {};
    }

    async function apiRequest(url, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...createAuthHeader(),
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

          if (response.status === 204) {
    return null; // Stop execution, return null, as the request was successful but had no content.
}

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            // Store credentials for basic auth
            currentUser = { userName: username, password: password };

            // Test authentication by calling a protected endpoint
            const greeting = await apiRequest('/user');

            welcomeMessage.textContent = `Welcome, ${username}`;
            showNotification('Login successful!', 'success');

            authSection.style.display = 'none';
            dashboard.style.display = 'block';

            loadUserData();
            loadJournalEntries();

        } catch (error) {
            showNotification('Login failed. Please check your credentials.', 'error');
            currentUser = null;
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const userData = {
            userName: formData.get('username'),
            password: formData.get('password')
        };

        try {
            await apiRequest('/public/create-user', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            showNotification('Account created successfully! Please login.', 'success');
            registerForm.reset();

        } catch (error) {
            showNotification('Registration failed. Username might already exist.', 'error');
        }
    });

    // Load user data including weather
    async function loadUserData() {
        try {
            const greeting = await apiRequest('/user');
            weatherInfo.textContent = greeting;

            // Extract temperature from greeting if available
            const tempMatch = greeting.match(/feels like ([\d.]+)/);
            if (tempMatch) {
                weatherDisplay.textContent = `${tempMatch[1]}°C`;
            }

        } catch (error) {
            console.error('Failed to load user data:', error);
            weatherInfo.textContent = `Hello, ${currentUser.userName}`;
        }
    }

    // Journal Entry Management
    async function loadJournalEntries() {
        try {
            const entries = await apiRequest('/journal');
            displayEntries(entries);
        } catch (error) {
            console.error('Failed to load entries:', error);
            entriesContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Failed to load entries</p>';
        }
    }

    function displayEntries(entries) {
        if (!entries || entries.length === 0) {
            entriesContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-journal-whills" style="font-size: 3rem; color: var(--neon-cyan); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--text-secondary); font-family: 'Orbitron', monospace;">No entries found</h3>
                    <p style="color: var(--text-secondary);">Start writing your first journal entry!</p>
                </div>
            `;
            return;
        }

        entriesContainer.innerHTML = entries.map(entry => {
            const date = new Date(entry.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            return `
                <div class="entry-card" data-id="${entry.id}">
                    <div class="entry-header">
                        <h4 class="entry-title">${entry.title}</h4>
                        <span class="entry-date">${formattedDate}</span>
                    </div>
                    <div class="entry-content">${entry.content}</div>
                    <div class="entry-actions">
                        <button class="action-btn edit-btn" onclick="editEntry('${entry.id}', '${entry.title}', '${entry.content}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteEntry('${entry.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Create new journal entry
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(entryForm);
        const entryData = {
            title: formData.get('title'),
            content: formData.get('content')
        };

        try {
            await apiRequest('/journal', {
                method: 'POST',
                body: JSON.stringify(entryData)
            });

            showNotification('Entry created successfully!', 'success');
            entryForm.reset();
            journalForm.classList.add('hidden');
            loadJournalEntries();

        } catch (error) {
            showNotification('Failed to create entry', 'error');
        }
    });

    // Edit entry function
    function editEntry(id, title, content) {
        currentEditingId = id;
        document.getElementById('edit-title').value = title;
        document.getElementById('edit-content').value = content;
        editModal.style.display = 'block';
    }

    // Update entry
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const entryData = {
            title: formData.get('title'),
            content: formData.get('content')
        };

        try {
            await apiRequest(`/journal/id/${currentEditingId}`, {
                method: 'PUT',
                body: JSON.stringify(entryData)
            });

            showNotification('Entry updated successfully!', 'success');
            editModal.style.display = 'none';
            loadJournalEntries();

        } catch (error) {
            showNotification('Failed to update entry', 'error');
        }
    });

    // Delete entry function
    async function deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            try {
                await apiRequest(`/journal/id/${id}`, {
                    method: 'DELETE'
                });

                showNotification('Entry deleted successfully!', 'success');
                loadJournalEntries();

            } catch (error) {
                showNotification('Failed to delete entry', 'error');
            }
        }
    }

    // Event Listeners
    document.getElementById('new-entry-btn').addEventListener('click', () => {
        journalForm.classList.toggle('hidden');
    });

    document.getElementById('cancel-entry').addEventListener('click', () => {
        journalForm.classList.add('hidden');
        entryForm.reset();
    });

    document.getElementById('refresh-btn').addEventListener('click', () => {
        const refreshIcon = document.querySelector('#refresh-btn i');
        refreshIcon.style.animation = 'spin 1s linear';
        loadJournalEntries();
        loadUserData();
        setTimeout(() => {
            refreshIcon.style.animation = '';
        }, 1000);
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            currentUser = null;
            authToken = null;
            authSection.style.display = 'grid';
            dashboard.style.display = 'none';
            loginForm.reset();
            registerForm.reset();
            showNotification('Logged out successfully!', 'success');
        }
    });

    // Modal controls
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    // Add some cyber effects
    document.addEventListener('DOMContentLoaded', () => {
        // Add glitch effect to random elements occasionally
        setInterval(() => {
            const elements = document.querySelectorAll('.entry-title, .auth-card h3, .header h1');
            const randomElement = elements[Math.floor(Math.random() * elements.length)];
            if (randomElement) {
                randomElement.style.animation = 'glitch 0.5s ease-in-out';
                setTimeout(() => {
                    randomElement.style.animation = '';
                }, 500);
            }
        }, 10000);

        // Add typing effect to welcome message
        function typeWriter(element, text, speed = 50) {
            element.innerHTML = '';
            let i = 0;
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }
            type();
        }

        // Particle effect for background (simplified)
        function createParticles() {
            const particleContainer = document.createElement('div');
            particleContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -1;
            `;
            document.body.appendChild(particleContainer);

            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: var(--neon-cyan);
                    opacity: 0.3;
                    animation: float ${Math.random() * 10 + 10}s linear infinite;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    box-shadow: 0 0 6px var(--neon-cyan);
                `;
                particleContainer.appendChild(particle);
            }

            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes float {
                    0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) translateX(10px) rotate(120deg); }
                    66% { transform: translateY(5px) translateX(-5px) rotate(240deg); }
                    100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        createParticles();

        // Add neon glow effect to buttons on hover
        document.querySelectorAll('.cyber-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.textShadow = '0 0 10px currentColor';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.textShadow = '';
            });
        });

        // Add scan line effect
        const scanLine = document.createElement('div');
        scanLine.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--neon-cyan), transparent);
            opacity: 0.5;
            animation: scanLine 4s linear infinite;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(scanLine);

        const scanStyle = document.createElement('style');
        scanStyle.textContent = `
            @keyframes scanLine {
                0% { top: -2px; }
                100% { top: 100vh; }
            }
        `;
        document.head.appendChild(scanStyle);
    });

    // Add some console styling for fun
    console.log(`
    %c
╔══════════════════════════════════════╗
║        NOVA JOURNAL INITIALIZED       ║
║            CYBERPUNK MODE             ║
║          >> SYSTEM ONLINE <<          ║
╚══════════════════════════════════════╝
    `,
    'color: #00ffff; font-family: monospace; font-size: 12px; background: #0a0a0a; padding: 10px;'
    );
