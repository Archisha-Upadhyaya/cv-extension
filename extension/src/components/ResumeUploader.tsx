import { useState } from 'react'
import { ResumeParser, ResumeStorage } from '../utils/resumeParser'
import type { ResumeData } from '../utils/resumeParser'

interface ResumeUploaderProps {
  apiKey: string
  onResumeUploaded: (data: ResumeData) => void
  onClose: () => void
  existingData?: ResumeData | null
}

function ResumeUploader({ apiKey, onResumeUploaded, onClose, existingData }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [lastError, setLastError] = useState('')
  const [resumeData, setResumeData] = useState<ResumeData>(existingData || {
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    achievements: '',
    education: '',
    summary: ''
  })
  const [showManualEdit, setShowManualEdit] = useState(!!existingData)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await processFile(file)
  }

  const processFile = async (file: File) => {
    setIsUploading(true)
    setUploadStatus('📄 Uploading and parsing resume with AI...')
    setLastError('')

    try {
      const parser = new ResumeParser(apiKey)
      const parsedData = await parser.parseResumeFile(file)
      
      setResumeData(parsedData)
      setShowManualEdit(true)
      setUploadStatus('✅ Resume parsed successfully! Please review and edit as needed.')
    } catch (error) {
      console.error('❌ Error parsing resume:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse resume'
      setLastError(errorMessage)
      setUploadStatus(`❌ Error: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRetry = () => {
    setUploadStatus('')
    setLastError('')
    // Trigger file input click
    document.getElementById('file-input')?.click()
  }

  const handleSave = async () => {
    if (!resumeData.name || !resumeData.email) {
      setUploadStatus('❌ Please provide at least name and email')
      return
    }

    try {
      await ResumeStorage.saveResumeData(resumeData)
      onResumeUploaded(resumeData)
      setUploadStatus('✅ Resume data saved successfully!')
      setTimeout(() => onClose(), 1000)
    } catch (error) {
      setUploadStatus('❌ Failed to save resume data')
    }
  }

  const handleInputChange = (field: keyof ResumeData, value: string) => {
    setResumeData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="w-80 min-h-96 bg-gradient-to-br from-purple-50 to-indigo-100 p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">📄 Resume Manager</h1>
            <p className="text-purple-100 text-sm mt-1">Upload and manage your resume data</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-700 rounded-md transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Status */}
        {uploadStatus && (
          <div className={`p-3 rounded-lg text-sm ${
            uploadStatus.includes('❌') || uploadStatus.includes('Error')
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : uploadStatus.includes('✅')
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {uploadStatus}
            {lastError && (
              <div className="mt-2">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => setShowManualEdit(true)}
                  className="ml-2 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium transition-colors"
                >
                  ✏️ Enter Manually
                </button>
              </div>
            )}
          </div>
        )}

        {/* File Upload Section */}
        {!showManualEdit && (
          <div className="bg-white rounded-lg p-4 shadow-sm border space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">📤 Upload Resume</h3>
              <p className="text-sm text-gray-600 mb-3">
                Supported formats: PDF, DOCX, TXT
              </p>
              
              <label className="block">
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
                />
              </label>

              {isUploading && (
                <div className="flex items-center mt-3">
                  <svg className="animate-spin h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-600">Parsing resume...</span>
                </div>
              )}
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">💡 How it works:</h4>
              <ol className="text-sm text-purple-700 space-y-1">
                <li>1. Upload your resume file</li>
                <li>2. AI extracts your information</li>
                <li>3. Review and edit details</li>
                <li>4. Save for personalized cover letters</li>
              </ol>
            </div>

            <button
              onClick={() => setShowManualEdit(true)}
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
            >
              ✏️ Enter Details Manually
            </button>
          </div>
        )}

        {/* Manual Edit Section */}
        {showManualEdit && (
          <div className="bg-white rounded-lg p-4 shadow-sm border space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">✏️ Edit Resume Details</h3>
              {
                <button
                  onClick={() => setShowManualEdit(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to Upload
                </button>
              }
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={resumeData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={resumeData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@domain.com"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={resumeData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Brief professional summary..."
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <textarea
                  value={resumeData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Your work experience..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <textarea
                  value={resumeData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="Your key skills (comma-separated)..."
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <textarea
                  value={resumeData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Your educational background..."
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievements</label>
                <textarea
                  value={resumeData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  placeholder="Notable achievements and accomplishments..."
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={handleSave}
                disabled={!resumeData.name || !resumeData.email}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  resumeData.name && resumeData.email
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                💾 Save Resume Data
              </button>
              <button
                onClick={onClose}
                className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeUploader
