# Resume Integration Guide

## Overview
The Chrome extension now includes a comprehensive resume uploader and parser that automatically extracts user information to generate personalized cover letters.

## Key Features

### 1. Resume Upload & Parsing
- **Supported Formats**: PDF, DOCX, TXT
- **Smart Parsing**: Uses specialized libraries (pdf-parse, mammoth) for accurate text extraction
- **AI Fallback**: Gemini AI parses resume content when structured parsing is insufficient
- **Data Storage**: Resume data is saved in Chrome's local storage (browser-based, no server required)

### 2. User Flow

#### First Use:
1. User opens the extension popup
2. If no resume data is found, user is prompted to upload resume when trying to generate a cover letter
3. Resume upload interface opens with file picker
4. File is parsed automatically (PDF/DOCX/TXT support)
5. Extracted data is displayed for user review and editing
6. User can manually edit or add missing information
7. Resume data is saved to browser storage

#### Subsequent Uses:
1. Extension automatically loads saved resume data
2. User sees a "📄" resume button in the header alongside settings
3. Clicking the resume button opens the resume manager for editing or re-uploading
4. Cover letters are generated using the saved resume data

### 3. Technical Implementation

#### File Structure:
```
extension/src/
├── components/
│   └── ResumeUploader.tsx     # Resume upload/edit UI component
├── utils/
│   └── resumeParser.ts        # Resume parsing logic & storage utilities
└── popup/
    └── App.tsx               # Main popup with integrated resume flow
```

#### Key Classes & Functions:

**ResumeParser Class:**
- `parseResumeFile(file: File)`: Main parsing function
- `parsePDF()`: PDF text extraction using pdf-parse
- `parseDOCX()`: Word document parsing using mammoth
- `parseWithAI()`: Gemini AI fallback parsing

**ResumeStorage Class:**
- `saveResumeData()`: Save to Chrome storage
- `getResumeData()`: Load from Chrome storage
- `hasResumeData()`: Check if data exists
- `clearResumeData()`: Remove stored data

**ResumeData Interface:**
```typescript
interface ResumeData {
  name: string
  email: string
  phone: string
  experience: string
  skills: string
  achievements: string
  education: string
  summary: string
}
```

### 4. Parsing Strategy

#### 1. Library-Based Parsing:
- **PDF**: Uses `pdf-parse` to extract plain text
- **DOCX**: Uses `mammoth` to convert to HTML then extract text
- **TXT**: Direct file reading

#### 2. Structured Data Extraction:
- Regex patterns to identify emails, phone numbers, names
- Section-based parsing for experience, education, skills
- Keyword detection for achievements and accomplishments

#### 3. AI Enhancement:
- If structured parsing is incomplete, uses Gemini AI
- Sends extracted text with specific prompts to identify resume sections
- AI fills in missing or poorly extracted information

### 5. User Interface

#### Resume Manager UI:
- **Upload Section**: File picker with format validation
- **Edit Section**: Form fields for all resume data
- **Status Feedback**: Real-time parsing status and error messages
- **Save/Cancel**: Actions to persist or discard changes

#### Main Popup Integration:
- **Header Button**: Resume icon (📄) for quick access
- **Smart Prompting**: Prompts for resume upload when needed
- **Status Display**: Shows resume status in footer
- **Seamless Flow**: Integrates naturally with cover letter generation

### 6. Data Privacy & Security
- **Local Storage Only**: All data stored in browser's local storage
- **No Server Communication**: Resume data never leaves the user's browser
- **User Control**: Users can view, edit, or delete their data anytime
- **API Key Separation**: Resume parsing and cover letter generation use the same Gemini API key

### 7. Error Handling
- **File Format Validation**: Clear error messages for unsupported formats
- **Parsing Failures**: Graceful fallback to manual entry
- **Storage Errors**: User-friendly error messages with retry options
- **Network Issues**: Offline parsing when possible, clear error states

### 8. Usage Examples

#### Generating a Cover Letter with Resume Data:
1. User selects job description text from webpage
2. Clicks "Generate Cover Letter"
3. Extension uses saved resume data to create personalized prompt:
   ```
   CANDIDATE PROFILE:
   - Name: John Doe
   - Email: john@example.com
   - Experience: 5 years software development...
   - Skills: JavaScript, React, Node.js...
   - Achievements: Led team of 5 developers...
   ```
4. Gemini AI generates highly personalized cover letter

#### Updating Resume Information:
1. User clicks resume button (📄) in header
2. Resume manager opens with current data pre-filled
3. User can re-upload new resume file or manually edit fields
4. Changes are saved and immediately available for cover letter generation

## Benefits

1. **Personalization**: Cover letters include specific user experience and skills
2. **Convenience**: One-time setup, reused for all job applications
3. **Accuracy**: Advanced parsing ensures comprehensive data extraction
4. **Privacy**: All data stays on user's device
5. **Flexibility**: Easy to update or modify resume information
6. **Professional Results**: AI generates highly targeted cover letters using real resume data

## Future Enhancements

1. **MongoDB Integration**: Optional cloud storage for resume data
2. **Multiple Resume Support**: Ability to save and switch between different resumes
3. **Template Customization**: User-defined cover letter templates
4. **Export Options**: Direct export to various formats (PDF, Word, etc.)
5. **Job Board Integration**: Direct application through the extension
