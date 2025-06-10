import React, { useState } from 'react';
import Header from './components/Header';
import ProjectNavigator from './components/ProjectNavigator';
import Editor from './components/Editor';
import AIAssistant from './components/AIAssistant';
import TemplateGallery from './components/TemplateGallery';
import { useDocuments } from './hooks/useDocuments';
import { aiService } from './services/aiService';

function App() {
  const [projectName, setProjectName] = useState('My Writing Project');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>('chapter-1');
  const [aiAssistantCollapsed, setAiAssistantCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    documents,
    findDocument,
    updateDocument,
    createDocument,
    deleteDocument,
    getDocumentStats
  } = useDocuments();

  const [currentDocument, setCurrentDocument] = useState(() => 
    findDocument('chapter-1') || null
  );

  const handleDocumentSelect = (id: string) => {
    setSelectedDocumentId(id);
    const doc = findDocument(id);
    setCurrentDocument(doc);
  };

  const handleDocumentCreate = async (name: string, type: 'document' | 'folder', parentId?: string, useAI?: boolean) => {
    const newId = createDocument(name, type, parentId);
    
    if (type === 'document') {
      // If AI generation is requested, generate actual AI content
      if (useAI) {
        // Set initial loading state
        updateDocument(newId, {
          content: `<div class="flex items-center justify-center p-8 text-gray-500"><div class="text-center"><div class="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div><p>Generating content with AI...</p></div></div>`,
          wordCount: 0
        });

        try {
          // Generate AI content based on document name
          let prompt = '';
          const lowerName = name.toLowerCase();
          
          if (lowerName.includes('chapter')) {
            prompt = `Write an engaging opening for a chapter titled "${name}". Create a compelling scene that draws readers in with vivid descriptions, interesting characters, and a hook that makes them want to continue reading.`;
          } else if (lowerName.includes('character')) {
            prompt = `Create a detailed character profile for "${name}". Include their background, personality traits, motivations, physical description, and key relationships. Make them feel like a real, three-dimensional person.`;
          } else if (lowerName.includes('research') || lowerName.includes('notes')) {
            prompt = `Generate comprehensive research notes and key points for "${name}". Include relevant facts, important considerations, and organized information that would be useful for a writing project.`;
          } else if (lowerName.includes('outline')) {
            prompt = `Create a detailed outline for "${name}". Structure it with clear sections, subsections, and key points that provide a roadmap for development.`;
          } else {
            prompt = `Write an introductory section for "${name}". Create engaging content that establishes the topic clearly and provides a strong foundation for further development.`;
          }

          const response = await aiService.generateContent({
            prompt,
            type: 'continue',
            context: `Document: ${name}`
          });

          if (response.error) {
            // If AI generation fails, provide a helpful message
            updateDocument(newId, {
              content: `<h1>${name}</h1><p><em>AI content generation encountered an issue: ${response.error}</em></p><p>You can start writing here, or try using the AI assistant in the sidebar to generate content.</p>`,
              wordCount: 0
            });
          } else {
            // Convert the AI response to HTML format
            const aiContent = response.content
              .split('\n\n')
              .map(paragraph => paragraph.trim())
              .filter(paragraph => paragraph.length > 0)
              .map(paragraph => {
                // Handle headings
                if (paragraph.startsWith('# ')) {
                  return `<h1>${paragraph.substring(2)}</h1>`;
                } else if (paragraph.startsWith('## ')) {
                  return `<h2>${paragraph.substring(3)}</h2>`;
                } else if (paragraph.startsWith('### ')) {
                  return `<h3>${paragraph.substring(4)}</h3>`;
                } else if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
                  // Handle bullet points (convert to proper list later)
                  return `<p>${paragraph}</p>`;
                } else {
                  return `<p>${paragraph}</p>`;
                }
              })
              .join('');

            const finalContent = `<h1>${name}</h1>${aiContent}<p><em>This content was generated with AI assistance. Feel free to edit, expand, or completely rewrite as needed.</em></p>`;
            
            // Calculate word count
            const textContent = finalContent.replace(/<[^>]*>/g, '');
            const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;

            updateDocument(newId, {
              content: finalContent,
              wordCount
            });
          }
        } catch (error) {
          console.error('AI generation error:', error);
          updateDocument(newId, {
            content: `<h1>${name}</h1><p><em>AI content generation failed. Please try again or start writing manually.</em></p><p>You can use the AI assistant in the sidebar to help generate content.</p>`,
            wordCount: 0
          });
        }
      } else {
        // No AI generation requested, create empty document
        updateDocument(newId, {
          content: `<h1>${name}</h1><p>Start writing here...</p>`,
          wordCount: 0
        });
      }
      
      // Auto-select the new document after a brief delay
      setTimeout(() => {
        handleDocumentSelect(newId);
      }, 150);
    }
  };

  const handleContentChange = (content: string) => {
    if (currentDocument) {
      // Strip HTML tags for word count
      const textContent = content.replace(/<[^>]*>/g, '');
      const wordCount = textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
      updateDocument(currentDocument.id, { content, wordCount });
      setCurrentDocument({ ...currentDocument, content, wordCount });
    }
  };

  const handleTitleChange = (title: string) => {
    if (currentDocument) {
      updateDocument(currentDocument.id, { title, name: title });
      setCurrentDocument({ ...currentDocument, title, name: title });
    }
  };

  const handleInsertContent = (content: string) => {
    if (currentDocument) {
      const newContent = currentDocument.content ? 
        `${currentDocument.content}<p>${content}</p>` : 
        `<p>${content}</p>`;
      handleContentChange(newContent);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setShowTemplateGallery(false);
    
    // Create a new document based on the template
    let templateContent = '';
    let templateName = '';
    
    switch (templateId) {
      case 'novel':
        templateName = 'New Novel';
        templateContent = `<h1>Chapter 1</h1><p>The story begins here...</p><p><em>Use the AI assistant to help develop your characters, plot, and dialogue.</em></p>`;
        break;
      case 'screenplay':
        templateName = 'New Screenplay';
        templateContent = `<p><strong>FADE IN:</strong></p><p><strong>EXT. LOCATION - DAY</strong></p><p>Scene description goes here.</p><p><strong>CHARACTER</strong><br>Dialogue goes here.</p><p><em>The AI can help format your screenplay and develop scenes.</em></p>`;
        break;
      case 'business-plan':
        templateName = 'Business Plan';
        templateContent = `<h1>Executive Summary</h1><h2>Company Overview</h2><h2>Market Analysis</h2><h2>Financial Projections</h2><p><em>AI assistance available for market research and financial modeling.</em></p>`;
        break;
      default:
        templateName = 'New Document';
        templateContent = `<h1>${templateName}</h1><p>Start writing here...</p><p><em>The AI assistant is ready to help with your writing.</em></p>`;
    }
    
    const newId = createDocument(templateName, 'document');
    setTimeout(() => {
      updateDocument(newId, { 
        content: templateContent, 
        wordCount: templateContent.replace(/<[^>]*>/g, '').split(/\s+/).length 
      });
      handleDocumentSelect(newId);
    }, 100);
  };

  const stats = getDocumentStats();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header 
        projectName={projectName} 
        onProjectNameChange={setProjectName}
        stats={stats}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />
      
      <div className="flex-1 flex">
        <ProjectNavigator
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          onDocumentSelect={handleDocumentSelect}
          onDocumentCreate={handleDocumentCreate}
          onDocumentUpdate={updateDocument}
          onDocumentDelete={deleteDocument}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
        
        <Editor
          content={currentDocument?.content || ''}
          onChange={handleContentChange}
          title={currentDocument?.title || ''}
          onTitleChange={handleTitleChange}
          documentName={currentDocument?.name || 'Untitled'}
        />
        
        <AIAssistant
          isCollapsed={aiAssistantCollapsed}
          onToggleCollapse={() => setAiAssistantCollapsed(!aiAssistantCollapsed)}
          currentDocument={currentDocument}
          onInsertContent={handleInsertContent}
          onUpdateDocument={updateDocument}
        />
      </div>

      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  );
}

export default App;