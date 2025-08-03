import { useState, useEffect } from 'react'
import ResumeUploader from '../components/ResumeUploader'
import { ResumeStorage } from '../utils/resumeParser'
import type { ResumeData } from '../utils/resumeParser'

function App() {
  const [selectedText, setSelectedText] = useState<string>('')
  const [isSelecting, setIsSelecting] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')
  const [coverLetter, setCoverLetter] = useState<string>('')
  const [showCoverLetter, setShowCoverLetter] = useState<boolean>(false)
  const [apiKey, setApiKey] = useState<string>('')
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [showResumeUploader, setShowResumeUploader] = useState<boolean>(false)
  const [hasCheckedResume, setHasCheckedResume] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    console.log('🚀 App component mounted')
    
    const initializeApp = async () => {
      try {
        // Load saved API key from storage
        const data = await chrome.storage.local.get(['geminiApiKey'])
        if (data.geminiApiKey) {
          setApiKey(data.geminiApiKey)
          console.log('✅ API key loaded')
        } else {
          setShowSettings(true) // Show settings if no API key
          console.log('⚠️ No API key found, showing settings')
        }

        // Load saved resume data
        try {
          const savedResumeData = await ResumeStorage.getResumeData()
          setResumeData(savedResumeData)
          setHasCheckedResume(true)
          
          if (!savedResumeData) {
            console.log('📄 No resume data found, user needs to upload resume')
          } else {
            console.log('📄 Resume data loaded:', savedResumeData.name)
          }
        } catch (error) {
          console.log('ℹ️ No resume data found or error loading:', error)
          setHasCheckedResume(true)
        }
        
        // Check for previously stored selected text
        try {
          const response = await chrome.runtime.sendMessage({ type: 'GET_STORED_TEXT' });
          if (response.selectedText && response.selectedText.trim()) {
            console.log('📥 Restored selected text from storage:', response.selectedText.substring(0, 100) + '...');
            setSelectedText(response.selectedText);
            setStatus('Previous text selection restored!');
          }
        } catch (error) {
          console.log('ℹ️ No stored text found or error retrieving:', error);
        }
        
        setIsLoading(false)
        console.log('✅ App initialization complete')
      } catch (error) {
        console.error('❌ Error initializing app:', error)
        setIsLoading(false)
      }
    }
    
    initializeApp()
    
    // Listen for messages from content script
    const handleMessage = (message: any) => {
      if (message.type === 'SELECTED_TEXT') {
        console.log('✅ Popup received selected text:', message.data);
        console.log('📊 Text preview:', message.data.substring(0, 100) + (message.data.length > 100 ? '...' : ''));
        setSelectedText(message.data)
        setIsSelecting(false)
        setStatus('Text captured successfully!')
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setStatus('❌ Please enter a valid API key')
      return
    }
    
    await chrome.storage.local.set({ geminiApiKey: apiKey })
    setShowSettings(false)
    setStatus('✅ API key saved! You can now generate cover letters.')
  }

  const handleSelectText = async () => {
    if (isSelecting) return
    
    setIsSelecting(true)
    setStatus('Starting text selection mode...')
    
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      console.log('📱 Active tab found:', tab)
      
      if (!tab) {
        throw new Error('No active tab found')
      }
      
      if (!tab.id) {
        throw new Error('Tab ID is undefined')
      }
      
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        throw new Error('Cannot inject content script on chrome:// or extension pages')
      }
      
      console.log('📤 Sending START_SELECTION message to tab:', tab.id)
      
      // Send message to content script to start text selection
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'START_SELECTION' })
      console.log('📨 Response from content script:', response)
      
      // Update status but don't close popup immediately
      setStatus('✋ Go to the page and select text. The popup will stay open to receive your selection.')
      
      // Optional: Close popup after a short delay to let user read the message
      setTimeout(() => {
        window.close()
      }, 2000)
    } catch (error) {
      console.error('❌ Error starting text selection:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Error: Could not start text selection'
      
      if (error instanceof Error) {
        if (error.message.includes('chrome://')) {
          errorMessage = 'Error: Cannot select text on Chrome internal pages'
        } else if (error.message.includes('Receiving end does not exist')) {
          errorMessage = 'Error: Content script not loaded. Try refreshing the page.'
        } else if (error.message.includes('No active tab')) {
          errorMessage = 'Error: No active tab found'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      setStatus(errorMessage)
      setIsSelecting(false)
    }
  }

  const handleClearText = () => {
    setSelectedText('')
    setStatus('')
    setCoverLetter('')
    setShowCoverLetter(false)
  }

  const createCoverLetterPrompt = (jobDescription: string, resumeData: ResumeData | null = null) => {
    // Use resume data if available, otherwise fall back to default values
    const name = resumeData?.name || '[Your Name]'
    const email = resumeData?.email || '[Your Email]'
    const phone = resumeData?.phone || '[Your Phone]'
    const experience = resumeData?.experience || ''
    const skills = resumeData?.skills || ''
    const achievements = resumeData?.achievements || ''
    const education = resumeData?.education || ''
    const summary = resumeData?.summary || ''

    return `You are a professional career coach and expert cover letter writer. Create a compelling, personalized cover letter based on this job description:

JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}
- Professional Summary: ${summary || 'Please create a compelling professional summary based on experience and skills'}
- Experience: ${experience || 'Please highlight relevant experience based on the job requirements'}
- Skills: ${skills || 'Please emphasize skills that match the job requirements'}  
- Education: ${education || 'Please mention relevant educational background'}
- Achievements: ${achievements || 'Please mention relevant accomplishments'}

REQUIREMENTS:
1. Start with a compelling opening that shows genuine interest
2. Highlight 2-3 most relevant qualifications from the job description
3. Include specific examples when possible
4. Show knowledge of the company/role
5. End with a strong call to action
6. Keep it concise and impactful (300-400 words)
7. Use a professional but engaging tone
8. Avoid generic phrases and clichés

FORMAT:
- Use proper business letter format
- Include placeholders for company name and hiring manager if not specified
- Make it ready to customize and send

Generate a cover letter that would make this candidate stand out for this specific position.`;
  }

  const generateCoverLetter = async (jobDescription: string, resumeData: ResumeData | null = null) => {
    if (!apiKey) {
      throw new Error('API key not configured. Please set your Gemini API key in settings.')
    }

    try {
      console.log('🤖 Generating cover letter with Gemini AI...')
      
      // Dynamic import to reduce bundle size
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const prompt = createCoverLetterPrompt(jobDescription, resumeData)
      const result = await model.generateContent(prompt)
      const coverLetter = result.response.text()

      console.log('✅ Cover letter generated successfully')
      
      return coverLetter
    } catch (error) {
      console.error('❌ Gemini API Error:', error)
      throw error
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (!selectedText.trim()) {
      setStatus('Please select some job description text first!')
      return
    }

    if (!apiKey) {
      setStatus('❌ Please set your Gemini API key in settings first!')
      setShowSettings(true)
      return
    }

    // Check if resume data is available, prompt user to upload if not
    if (!resumeData && hasCheckedResume) {
      setStatus('📄 Please upload your resume first for personalized cover letters!')
      setShowResumeUploader(true)
      return
    }
    
    setIsGenerating(true)
    setStatus('🤖 Generating personalized cover letter...')
    setCoverLetter('')
    setShowCoverLetter(false)
    
    try {
      const generatedLetter = await generateCoverLetter(selectedText, resumeData)
      setCoverLetter(generatedLetter)
      setShowCoverLetter(true)
      setStatus('✅ Cover letter generated successfully!')
    } catch (error) {
      console.error('❌ Error generating cover letter:', error)
      
      let errorMessage = 'Failed to generate cover letter'
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID') || error.message.includes('API key not valid') || error.message.includes('invalid')) {
          errorMessage = '❌ Invalid API key. Please check your Gemini API key in settings.'
          setShowSettings(true)
        } else if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('exceeded')) {
          errorMessage = '❌ API quota exceeded. Please try again later or check your Gemini usage.'
        } else if (error.message.includes('API key not configured') || error.message.includes('key')) {
          errorMessage = '❌ Please set your Gemini API key in settings first!'
          setShowSettings(true)
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '❌ Network error. Please check your internet connection and try again.'
        } else {
          errorMessage = `❌ Error: ${error.message}`
        }
      }
      
      setStatus(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleResumeUploaded = (newResumeData: ResumeData) => {
    setResumeData(newResumeData)
    setShowResumeUploader(false)
    setStatus('✅ Resume data saved! You can now generate personalized cover letters.')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter)
      setStatus('✅ Cover letter copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      setStatus('❌ Failed to copy to clipboard')
    }
  }

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="w-80 min-h-96 bg-gradient-to-br from-blue-50 to-indigo-100 p-0 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading extension...</p>
        </div>
      </div>
    )
  }

  // Show resume uploader if requested
  if (showResumeUploader) {
    return (
      <ResumeUploader
        apiKey={apiKey}
        onResumeUploaded={handleResumeUploaded}
        onClose={() => setShowResumeUploader(false)}
        existingData={resumeData}
      />
    )
  }

  if (showSettings) {
    return (
      <div className="w-80 min-h-96 bg-gradient-to-br from-blue-50 to-indigo-100 p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
          <h1 className="text-lg font-bold text-center">⚙️ Settings</h1>
          <p className="text-blue-100 text-sm text-center mt-1">Configure your Gemini API key</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Status */}
          {status && (
            <div className={`p-3 rounded-lg text-sm ${
              status.includes('❌') || status.includes('Error')
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {status}
            </div>
          )}

          <div className="bg-white rounded-lg p-4 shadow-sm border space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🔑 Gemini API Key</h3>
              <p className="text-sm text-gray-600 mb-3">
                Get your free API key from: <br/>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline">https://aistudio.google.com/app/apikey</a>
              </p>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key (AIza...)"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">ℹ️ How to get API key:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Visit Google AI Studio</li>
                <li>2. Sign in with Google account</li>
                <li>3. Click "Create API Key"</li>
                <li>4. Copy and paste here</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2">
                🆓 Free tier: 15 requests/minute, 1M tokens/day
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveApiKey}
                disabled={!apiKey.trim()}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  apiKey.trim()
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save API Key
              </button>
              {apiKey && (
                <button
                  onClick={() => setShowSettings(false)}
                  className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 min-h-96 bg-gradient-to-br from-blue-50 to-indigo-100 p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">Cover Letter Generator</h1>
            <p className="text-blue-100 text-sm mt-1">AI-powered job application assistant</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowResumeUploader(true)}
              className="p-2 hover:bg-blue-700 rounded-md transition-colors"
              title={resumeData ? 'Edit Resume' : 'Upload Resume'}
            >
              📄
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-blue-700 rounded-md transition-colors"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Status */}
        {status && (
          <div className={`p-3 rounded-lg text-sm ${
            status.includes('Error') || status.includes('❌') || status.includes('Failed')
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : status.includes('success') || status.includes('✅')
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {status}
          </div>
        )}

        {/* Show Cover Letter or Job Description Section */}
        {showCoverLetter ? (
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Generated Cover Letter
              </h3>
              <button
                onClick={() => setShowCoverLetter(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {coverLetter}
              </pre>
            </div>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>
              <button
                onClick={handleGenerateCoverLetter}
                disabled={isGenerating}
                className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Job Description
            </h3>
            
            <button
              onClick={handleSelectText}
              disabled={isSelecting}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                isSelecting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSelecting ? 'Selecting...' : 'Select Text from Page'}
            </button>

            {selectedText && (
              <div className="mt-3">
                <div className="bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-700 line-clamp-4">
                    {selectedText.substring(0, 200)}
                    {selectedText.length > 200 ? '...' : ''}
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {selectedText.length} characters selected
                  </span>
                  <button
                    onClick={handleClearText}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!showCoverLetter && (
          <div className="space-y-2">
            <button
              onClick={handleGenerateCoverLetter}
              disabled={!selectedText.trim() || isGenerating || !apiKey}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center ${
                selectedText.trim() && !isGenerating && apiKey
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Generate Cover Letter
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          {!apiKey ? (
            '⚙️ Click settings to add your API key first'
          ) : !resumeData ? (
            '📄 Click the resume button to upload your resume for personalized letters'
          ) : selectedText ? (
            `✅ Ready! Resume: ${resumeData.name} | Job text selected`
          ) : (
            '📝 Select job description text to get started'
          )}
        </div>
      </div>
    </div>
  )
}

export default App
