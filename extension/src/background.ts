console.log("Background script loaded!");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "JOB_TEXT") {
    console.log("📄 Background: Job data received from content script:", message.data.substring(0, 100) + '...');
    // Forward to popup if it's open
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup might not be open, ignore error
    });
  } else if (message.type === "SELECTED_TEXT") {
    console.log("📋 Background: Selected text received:", message.data);
    console.log("📏 Background: Text length:", message.data.length, "characters");
    
    // Store selected text in chrome storage for persistence
    chrome.storage.local.set({
      selectedText: message.data,
      selectionTimestamp: Date.now()
    }).then(() => {
      console.log("✅ Background: Selected text stored in chrome.storage");
    });
    
    // Forward to popup if it's open
    chrome.runtime.sendMessage(message).catch(() => {
      // Popup might not be open, ignore error
      console.log("ℹ️ Background: Popup not open, text stored for later retrieval");
    });
  } else if (message.type === "GET_STORED_TEXT") {
    // Handle requests from popup to get stored text
    chrome.storage.local.get(['selectedText', 'selectionTimestamp']).then((data) => {
      sendResponse({
        selectedText: data.selectedText || '',
        timestamp: data.selectionTimestamp || null
      });
    });
    return true; // Will respond asynchronously
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});
