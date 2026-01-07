// Content Script to scrape problem details

function getProblemDetails() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    let details = {
        platform: 'Unknown',
        title: document.title,
        description: '',
        code: ''
    };

    try {
        if (hostname.includes('leetcode.com')) {
            details.platform = 'LeetCode';
            // LeetCode selectors (these change often, best effort)
            const titleElem = document.querySelector('[data-cy="question-title"]');
            if (titleElem) details.title = titleElem.innerText;

            const descElem = document.querySelector('[data-track-load="description_content"]');
            if (descElem) details.description = descElem.innerText;

            // Try to find code editor content - difficult as it's often in Monaco/CodeMirror
            // We might need to ask user to paste code if we can't grab it easily.
        }
        else if (hostname.includes('geeksforgeeks.org')) {
            details.platform = 'GeeksforGeeks';
            const titleElem = document.querySelector('.problems_header_content__title__h1__4t8ej'); // Example selector
            if (titleElem) details.title = titleElem.innerText;

            const descElem = document.querySelector('.problems_problem_content__Xmj_I');
            if (descElem) details.description = descElem.innerText;
        }
        // Add other platforms (Codeforces, HackerRank) similarly
    } catch (e) {
        console.error("Student Buddy: Error scraping content", e);
    }

    return details;
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProblemContext") {
        const details = getProblemDetails();
        sendResponse(details);
    }
});
