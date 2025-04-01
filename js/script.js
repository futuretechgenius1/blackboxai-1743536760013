// API Configuration
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = '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';
const MODEL = 'mixtral-8x7b-32768-v0.1';

// DOM Elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatContainer = document.getElementById('chat-container');
const submitButton = chatForm.querySelector('button[type="submit"]');

// Message history
let messageHistory = [];

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    submitButton.disabled = !this.value.trim();
});

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    // Add user message to chat
    appendMessage('user', message);
    messageHistory.push({ role: 'user', content: message });

    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    submitButton.disabled = true;

    try {
        // Show loading indicator
        const loadingDiv = showLoading();

        // Call API
        const response = await callAPI(messageHistory, MODEL);
        const assistantMessage = response.choices[0].message.content;

        // Remove loading indicator
        loadingDiv.remove();

        // Add assistant message to chat
        appendMessage('assistant', assistantMessage);
        messageHistory.push({ role: 'assistant', content: assistantMessage });
    } catch (error) {
        showError(error.message);
    }

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
});

// API call function
async function callAPI(messages, model) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to get response');
        }

        return await response.json();
    } catch (error) {
        throw new Error(`API Error: ${error.message}`);
    }
}

// Append message to chat
function appendMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = role === 'user' ? 
        '<i class="fas fa-user"></i>' : 
        '<i class="fas fa-robot"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatContainer.appendChild(messageDiv);
}

// Show loading indicator
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-robot"></i>
        </div>
        <span></span>
        <span></span>
        <span></span>
    `;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return loadingDiv;
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    chatContainer.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Handle new chat button
document.querySelector('button').addEventListener('click', () => {
    messageHistory = [];
    chatContainer.innerHTML = `
        <div class="text-center py-10">
            <h1 class="text-4xl font-bold mb-10">ChatGPT Clone</h1>
            <p class="text-lg text-gray-300">How can I help you today?</p>
        </div>
    `;
});