// Side Panel Logic - Premium Edition v2.0
const CONFIG_KEY = "OPENAI_API_KEY"; // Just referencing for internal check

// DOM Elements
const problemTitleSpan = document.getElementById('problem-title');
const refreshContextBtn = document.getElementById('refresh-context');
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const toolBtns = document.querySelectorAll('.action-chip');
const welcomeState = document.querySelector('.welcome-state');

// State
let currentContext = null;
let chatHistory = [];
let isTyping = false;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    setupAutoResize();
    setupTools();
    setupInputListeners();
    await refreshContext();
    checkWelcomeState();
});

function checkWelcomeState() {
    if (chatHistory.length > 0) {
        if (welcomeState) welcomeState.style.display = 'none';
    } else {
        if (welcomeState) welcomeState.style.display = 'block';
    }
}

// --- Tools Logic ---
function setupTools() {
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            executeTool(action);
        });
    });
}

function executeTool(action) {
    if (isTyping) return;

    let userMessage = "";
    let visibleText = "";

    switch (action) {
        case 'hint':
            userMessage = "I need a small hint to move forward. Don't give me the code yet.";
            visibleText = "💡 Requested a hint";
            break;
        case 'debug':
            userMessage = "I'm having trouble with my code. Please treat the next message as my code attempt. Analyze logic errors and edge cases without rewriting the whole solution.";
            visibleText = "🐛 Requesting debug session";
            userInput.value = "// Paste code here...";
            userInput.focus();
            handleInputState();
            return; // Wait for user to send code
        case 'complexity':
            userMessage = "Analyze the time and space complexity of the expected optimal solution vs a naive approach for this problem.";
            visibleText = "⚡ Checking Big-O Complexity";
            break;
        case 'similar':
            userMessage = "Suggest 3 similar leetcode/DSA problems that use the same underlying pattern or data structure.";
            visibleText = "🎯 Finding similar problems";
            break;
    }

    if (userMessage) {
        appendUserMessage(visibleText, userMessage);
        triggerAIResponse();
    }
}

// --- Context ---
refreshContextBtn.addEventListener('click', refreshContext);

async function refreshContext() {
    const contextBar = document.querySelector('.context-bar');
    problemTitleSpan.textContent = "Scanning...";

    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length === 0) return;

        chrome.tabs.sendMessage(tabs[0].id, { action: "getProblemContext" }, (response) => {
            if (chrome.runtime.lastError || !response || !response.title) {
                problemTitleSpan.textContent = "No supported problem detected";
                contextBar.style.borderColor = "var(--border-subtle)";
                currentContext = null;
                return;
            }

            currentContext = response;
            problemTitleSpan.textContent = `${response.platform}: ${response.title}`;
            contextBar.style.borderColor = "var(--success)"; // subtle success indicator
        });
    } catch (error) {
        console.error(error);
    }
}

// --- Chat & Input ---
function setupInputListeners() {
    userInput.addEventListener('input', handleInputState);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    sendBtn.addEventListener('click', () => handleSendMessage());
}

function handleInputState() {
    // Auto Resize
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';

    // Enable/Disable Send Button
    const isDisabled = userInput.value.trim() === '';
    sendBtn.disabled = isDisabled;
}

function setupAutoResize() {
    // Initial check
    handleInputState();
}

async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text || isTyping) return;

    userInput.value = '';
    handleInputState();

    appendUserMessage(text, text);
    await triggerAIResponse();
}

function appendUserMessage(displayText, actualPayload) {
    checkWelcomeState(); // Hide welcome screen if first message

    addMessageToUI('user', displayText);
    chatHistory.push({ role: 'user', text: actualPayload });
}

async function triggerAIResponse() {
    isTyping = true;
    // Create AI Bubble wrapper
    const loadingId = addMessageToUI('ai', '<span class="typing-dots">Thinking</span>', true);

    try {
        if (typeof SECRETS === 'undefined' || !SECRETS.OPENAI_API_KEY || SECRETS.OPENAI_API_KEY.includes("YOUR_OPEN_AI_KEY")) {
            throw new Error("Missing API Key. Please configure secrets.js!");
        }

        const apiKey = SECRETS.OPENAI_API_KEY;
        let responseText = await callOpenAI(apiKey, chatHistory, currentContext);
        updateMessageUI(loadingId, responseText, 'ai');
        chatHistory.push({ role: 'model', text: responseText });
    } catch (error) {
        console.error(error);
        updateMessageUI(loadingId, "Error: " + error.message, 'error');
    } finally {
        isTyping = false;
    }
}

// --- UI Rendering ---

function addMessageToUI(role, text, isLoading = false) {
    const isAi = role === 'ai';

    const msgContainer = document.createElement('div');
    msgContainer.className = `message ${role}`;

    // Meta line (Name)
    if (isAi) {
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.innerHTML = '<span class="meta-name">Student Buddy</span>';
        msgContainer.appendChild(meta);
    }

    // Content Bubble
    const bubble = document.createElement('div');
    bubble.className = 'message-content';

    if (isLoading) {
        bubble.id = 'loading-' + Date.now();
        bubble.innerHTML = text; // "Thinking..."
    } else {
        bubble.innerHTML = formatText(text);
    }

    msgContainer.appendChild(bubble);
    chatContainer.appendChild(msgContainer);
    scrollToBottom();

    return bubble.id ? bubble.id : null;
}

function updateMessageUI(id, text, type) {
    const bubble = document.getElementById(id);
    if (bubble) {
        if (type === 'error') {
            bubble.style.color = '#f87171'; // Error Red
            bubble.textContent = text;
        } else {
            bubble.innerHTML = formatText(text);
        }
        scrollToBottom();
    }
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Basic formatter
function formatText(text) {
    let s = text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        .replace(/\n/g, '<br>');
    return s;
}

// --- API ---
async function callOpenAI(apiKey, history, context) {
    const url = 'https://api.openai.com/v1/chat/completions';

    let systemContent = CONFIG.SYSTEM_PROMPT;
    if (context) {
        systemContent += `\n\nCURRENT PROBLEM CONTEXT:\nPlatform: ${context.platform}\nTitle: ${context.title}\nDescription: ${context.description}\n`;
    }

    const messages = [
        { role: "system", content: systemContent }
    ];

    history.forEach(msg => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        });
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-4", messages: messages })
    });

    if (!response.ok) {
        throw new Error((await response.json()).error?.message || response.statusText);
    }

    return (await response.json()).choices[0].message.content;
}
