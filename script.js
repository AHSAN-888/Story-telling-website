document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('promptInput');
    const loadingDiv = document.getElementById('loading');
    const storyContainer = document.getElementById('storyContainer');
    const storyText = document.getElementById('storyText');
    const errorContainer = document.getElementById('errorContainer');
    const errorText = document.getElementById('errorText');

    const apiKey = "AIzaSyAK4EF5zhVNolQXBZjfEkxhd8Z1wikF2Vg";
    let chatHistory = [];
    const systemInstruction = `You are an AI Chatbot assistant.

You can:
* Answer general questions
* Have conversations
* Help with ideas, explanations, and discussions
* Also generate stories if asked

Always respond clearly, helpfully, and conversationally like a chatbot.`;

    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();

        if (!prompt) {
            showError('Please enter a prompt.');
            return;
        }

        // Hide previous elements
        storyContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');

        // Show loading
        loadingDiv.classList.remove('hidden');
        generateBtn.disabled = true;

        try {
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });

            const requestBody = {
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: chatHistory
            };

            const model = "gemini-1.5-flash";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                // Remove failed message from history
                chatHistory.pop();
                throw new Error(data.error?.message || 'A problem occurred.');
            }

            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                const chatbotResponse = data.candidates[0].content.parts[0].text;
                
                chatHistory.push({ role: "model", parts: [{ text: chatbotResponse }] });

                // Ensure chat behaves like a chatbot
                const formattedResponse = chatbotResponse.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
                storyText.innerHTML = `<p>${formattedResponse}</p>`;

                loadingDiv.classList.add('hidden');
                storyContainer.classList.remove('hidden');

                // Scroll to response gently
                storyContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                throw new Error("Invalid response format from server.");
            }

        } catch (err) {
            loadingDiv.classList.add('hidden');
            showError("Error: " + err.message);
        } finally {
            generateBtn.disabled = false;
        }
    });

    function showError(message) {
        errorText.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    // Allow Ctrl+Enter or Cmd+Enter to generate
    promptInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            generateBtn.click();
        }
    });
});
