console.log("Content script loaded!");
console.log("📍 Page URL:", window.location.href);
console.log("📄 Page title:", document.title);

// Send initial page text (existing functionality)
const jobText = document.body.innerText;
chrome.runtime.sendMessage({ type: "JOB_TEXT", data: jobText });

// Text selection functionality
let isSelectionMode = false;
let selectionOverlay: HTMLDivElement | null = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('📨 Content script received message:', message)
  
  if (message.type === 'START_SELECTION') {
    try {
      startTextSelection();
      console.log('✅ Text selection started successfully')
      sendResponse({ success: true });
    } catch (error) {
      console.error('❌ Error starting text selection:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      sendResponse({ success: false, error: errorMessage });
    }
  }
  
  // Return true to indicate we will send a response asynchronously
  return true;
});

function startTextSelection() {
  if (isSelectionMode) return;
  
  console.log('🎯 Starting text selection mode on page:', window.location.href);
  
  isSelectionMode = true;
  document.body.style.userSelect = 'text';
  document.body.style.cursor = 'text';
  
  // Create overlay to show selection mode
  createSelectionOverlay();
  
  // Listen for text selection
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keydown', handleKeyDown);
}

function createSelectionOverlay() {
  selectionOverlay = document.createElement('div');
  selectionOverlay.id = 'text-selection-overlay';
  selectionOverlay.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #3b82f6;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
    ">
      📝 Select text with your mouse, then press Enter or Escape to finish
    </div>
  `;
  document.body.appendChild(selectionOverlay);
}

function handleTextSelection(_event: MouseEvent) {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    const selectedText = selection.toString().trim();
    
    // Log the copied text
    console.log('📋 Text copied from page:', selectedText);
    console.log('📏 Text length:', selectedText.length, 'characters');
    
    // Send selected text to popup
    chrome.runtime.sendMessage({ 
      type: 'SELECTED_TEXT', 
      data: selectedText 
    });
    
    // Clean up
    endSelectionMode();
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === 'Escape') {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    
    if (selectedText.length > 0) {
      // Log the copied text
      console.log('📋 Text copied from page (via keyboard):', selectedText);
      console.log('📏 Text length:', selectedText.length, 'characters');
      
      chrome.runtime.sendMessage({ 
        type: 'SELECTED_TEXT', 
        data: selectedText 
      });
    } else {
      console.log('⚠️ No text selected when finishing selection mode');
    }
    
    endSelectionMode();
  }
}

function endSelectionMode() {
  console.log('🏁 Ending text selection mode');
  
  isSelectionMode = false;
  document.body.style.userSelect = '';
  document.body.style.cursor = '';
  
  // Remove overlay
  if (selectionOverlay) {
    selectionOverlay.remove();
    selectionOverlay = null;
  }
  
  // Remove event listeners
  document.removeEventListener('mouseup', handleTextSelection);
  document.removeEventListener('keydown', handleKeyDown);
  
  // Clear selection
  if (window.getSelection) {
    window.getSelection()?.removeAllRanges();
  }
}
