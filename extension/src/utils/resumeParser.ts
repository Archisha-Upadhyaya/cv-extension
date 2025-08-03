import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ResumeData {
  name: string
  email: string
  phone: string
  experience: string
  skills: string
  achievements: string
  education: string
  summary: string
}

export class ResumeParser {
  private genAI: GoogleGenerativeAI | null = null

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  async parseResumeFile(file: File): Promise<ResumeData> {
    try {
      console.log('📄 Parsing resume file with LLM:', file.name, file.type)
      
      if (!this.genAI) {
        throw new Error('API key is required for resume parsing. Please set your Gemini API key.')
      }

      // Validate file type
      if (!this.isValidFileType(file)) {
        throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT files.')
      }

      // Use LLM-based parsing for all file types
      const resumeData = await this.parseWithLLM(file)
      
      console.log('✅ LLM parsing completed successfully')
      return resumeData
    } catch (error) {
      console.error('❌ Error parsing resume:', error)
      throw error
    }
  }

  private isValidFileType(file: File): boolean {
    const supportedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ]
    return supportedTypes.includes(file.type)
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = () => reject(new Error('File reading failed'))
      reader.readAsDataURL(file)
    })
  }

  private getMimeType(file: File): string {
    // Map file types to proper MIME types for Gemini API
    switch (file.type) {
      case 'application/pdf':
        return 'application/pdf'
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      case 'text/plain':
        return 'text/plain'
      default:
        return file.type
    }
  }

  private async parseWithLLM(file: File): Promise<ResumeData> {
    try {
      if (!this.genAI) {
        throw new Error('AI parsing not available - no API key provided')
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      // Convert file to base64
      const base64Data = await this.fileToBase64(file)
      const mimeType = this.getMimeType(file)

      console.log(`📤 Sending ${file.type} file to Gemini API...`)

      const systemPrompt = `You are a professional resume parser. Your task is to extract structured information from the uploaded resume file and return it as a valid JSON object.

IMPORTANT INSTRUCTIONS:
1. Extract information accurately from the resume
2. Return ONLY a valid JSON object with the exact structure shown below
3. Do not include any markdown formatting, explanations, or additional text
4. If a field is not found, use an empty string ""
5. For experience and skills, provide meaningful summaries, not just raw text

Required JSON structure:
{
  "name": "Full name of the person",
  "email": "Email address", 
  "phone": "Phone number (formatted nicely)",
  "experience": "Professional experience summary (2-3 sentences highlighting key roles and achievements)",
  "skills": "Key technical and professional skills (comma-separated list)",
  "achievements": "Notable achievements, awards, or accomplishments",
  "education": "Educational background (degrees, institutions, dates)",
  "summary": "Professional summary or objective statement"
}`

      const result = await model.generateContent([
        { text: systemPrompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ])

      const response = result.response.text()
      console.log('📥 Received response from Gemini API')
      
      // Parse and validate the response
      return this.parseAndValidateResponse(response)
      
    } catch (error) {
      console.error('❌ Error in LLM parsing:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('API_KEY_INVALID')) {
          throw new Error('Invalid API key. Please check your Gemini API key.')
        } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
          throw new Error('Rate limit exceeded. Please try again in a moment.')
        } else if (error.message.includes('FILE_TOO_LARGE')) {
          throw new Error('File is too large. Please use a smaller file.')
        }
      }
      
      throw new Error('Failed to parse resume with AI. Please try again or enter details manually.')
    }
  }

  private parseAndValidateResponse(response: string): ResumeData {
    try {
      // Clean up the response (remove any markdown formatting)
      let cleanedResponse = response.trim()
      
      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\n?|\n?```/g, '')
      cleanedResponse = cleanedResponse.replace(/```\n?|\n?```/g, '')
      
      // Find JSON object in the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON object found in response')
      }
      
      const parsedData = JSON.parse(jsonMatch[0])
      
      // Validate and create ResumeData object
      const resumeData: ResumeData = {
        name: this.cleanString(parsedData.name || ''),
        email: this.cleanString(parsedData.email || ''),
        phone: this.cleanString(parsedData.phone || ''),
        experience: this.cleanString(parsedData.experience || ''),
        skills: this.cleanString(parsedData.skills || ''),
        achievements: this.cleanString(parsedData.achievements || ''),
        education: this.cleanString(parsedData.education || ''),
        summary: this.cleanString(parsedData.summary || '')
      }
      
      // Basic validation
      if (!resumeData.name && !resumeData.email) {
        throw new Error('Could not extract essential information (name or email) from the resume')
      }
      
      return resumeData
      
    } catch (error) {
      console.error('❌ Error parsing LLM response:', error)
      if (error instanceof SyntaxError) {
        throw new Error('Invalid response format from AI. Please try again.')
      }
      throw error
    }
  }

  private cleanString(str: string): string {
    if (!str) return ''
    return str.trim().replace(/\n\s*\n/g, '\n').replace(/\s+/g, ' ')
  }
}

// Storage utilities
export class ResumeStorage {
  static async saveResumeData(data: ResumeData): Promise<void> {
    await chrome.storage.local.set({ 
      resumeData: data,
      resumeLastUpdated: new Date().toISOString()
    })
    console.log('✅ Resume data saved to storage')
  }

  static async getResumeData(): Promise<ResumeData | null> {
    const result = await chrome.storage.local.get(['resumeData'])
    return result.resumeData || null
  }

  static async hasResumeData(): Promise<boolean> {
    const data = await this.getResumeData()
    return data !== null && !!data.name && !!data.email
  }

  static async clearResumeData(): Promise<void> {
    await chrome.storage.local.remove(['resumeData', 'resumeLastUpdated'])
    console.log('🗑️ Resume data cleared from storage')
  }
}
