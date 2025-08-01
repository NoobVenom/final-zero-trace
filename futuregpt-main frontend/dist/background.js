// Background script for zeroTrace extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('zeroTrace extension installed');
});

// Handle API requests to bypass CORS
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'API_REQUEST') {
    fetch(request.url, request.options)
      .then(response => {
        if (request.stream) {
          // Handle streaming response
          const reader = response.body.getReader();
          const stream = new ReadableStream({
            start(controller) {
              function pump() {
                return reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  return pump();
                });
              }
              return pump();
            }
          });
          
          return new Response(stream).text();
        } else {
          return response.json();
        }
      })
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep message channel open for async response
  }
});