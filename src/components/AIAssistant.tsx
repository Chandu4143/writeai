import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, Lightbulb, MessageSquare, FileText, 
  BarChart3, Zap, Send, Minimize2, Maximize2, Settings,
  Loader2, AlertCircle, CheckCircle, Copy, RefreshCw
} from 'lucide-react';
import { aiService, AIRequest, AIResponse } from '../services/aiService';
import { Document } from '../hooks/useDocuments';

interface AIAssistantProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentDocument?: Document | null;
  onInsertContent?: (content: string) => void;
  onUpdateDocument?: (id: string, updates: Partial<Document>) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  message: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

export default function AIAssistant({ 
  isCollapsed, 
  onToggleCollapse, 
  currentDocument,
  onInsertContent,
  onUpdateDocument
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'assistant' | 'notes' | 'research'>('assistant');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [conversations, setConversations] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'system',
      message: 'AI Assistant is ready to help with your writing! Try asking me to continue your story, improve your text, or brainstorm new ideas.',
      timestamp: new Date()
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { 
      label: "Continue writing", 
      type: 'continue' as const,
      icon: <Zap className="w-4 h-4" />,
      prompt: "Continue writing this story naturally, maintaining the same tone and style."
    },
    { 
      label: "Improve this text", 
      type: 'improve' as const,
      icon: <Sparkles className="w-4 h-4" />,
      prompt: "Improve this text for better clarity, flow, and engagement."
    },
    { 
      label: "Brainstorm ideas", 
      type: 'brainstorm' as const,
      icon: <Lightbulb className="w-4 h-4" />,
      prompt: "Generate creative ideas and directions for this story."
    },
    { 
      label: "Create outline", 
      type: 'outline' as const,
      icon: <FileText className="w-4 h-4" />,
      prompt: "Create a detailed outline for this content."
    },
    { 
      label: "Develop characters", 
      type: 'character' as const,
      icon: <MessageSquare className="w-4 h-4" />,
      prompt: "Help develop characters with depth and personality."
    }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    if (!currentDocument?.content && action.type !== 'brainstorm' && action.type !== 'character') {
      addMessage('system', 'Please select a document with content to use this feature.');
      return;
    }

    await sendAIRequest({
      prompt: action.prompt,
      type: action.type,
      currentContent: currentDocument?.content,
      context: `Document: ${currentDocument?.name || 'Untitled'}`
    });
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage = prompt.trim();
    setPrompt('');
    
    addMessage('user', userMessage);
    
    // Determine AI request type based on message content
    let requestType: AIRequest['type'] = 'continue';
    if (userMessage.toLowerCase().includes('improve') || userMessage.toLowerCase().includes('better')) {
      requestType = 'improve';
    } else if (userMessage.toLowerCase().includes('brainstorm') || userMessage.toLowerCase().includes('ideas')) {
      requestType = 'brainstorm';
    } else if (userMessage.toLowerCase().includes('outline')) {
      requestType = 'outline';
    } else if (userMessage.toLowerCase().includes('character')) {
      requestType = 'character';
    } else if (userMessage.toLowerCase().includes('dialogue')) {
      requestType = 'dialogue';
    }

    await sendAIRequest({
      prompt: userMessage,
      type: requestType,
      currentContent: currentDocument?.content,
      context: `Document: ${currentDocument?.name || 'Untitled'}`
    });
  };

  const sendAIRequest = async (request: AIRequest) => {
    const loadingId = Date.now().toString();
    addMessage('ai', '', true, loadingId);
    setIsLoading(true);

    try {
      let response: AIResponse;
      
      if (apiKey) {
        aiService.setApiKey(apiKey);
        response = await aiService.generateContent(request);
      } else {
        response = await aiService.simulateAIResponse(request);
      }

      // Remove loading message
      setConversations(prev => prev.filter(msg => msg.id !== loadingId));

      if (response.error) {
        addMessage('system', response.error);
      } else {
        addMessage('ai', response.content);
      }
    } catch (error) {
      setConversations(prev => prev.filter(msg => msg.id !== loadingId));
      addMessage('system', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (type: ChatMessage['type'], message: string, loading = false, id?: string) => {
    const newMessage: ChatMessage = {
      id: id || Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      isLoading: loading
    };
    setConversations(prev => [...prev, newMessage]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const insertContent = (content: string) => {
    if (onInsertContent) {
      onInsertContent(content);
    }
  };

  const handleNotesChange = (notes: string) => {
    if (currentDocument && onUpdateDocument) {
      onUpdateDocument(currentDocument.id, { notes });
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gradient-to-b from-purple-50 to-blue-50 border-l border-gray-200 flex flex-col items-center py-4 space-y-4">
        <button 
          onClick={onToggleCollapse}
          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <div className="w-6 h-px bg-gray-300"></div>
        <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors">
          <Bot className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <FileText className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <BarChart3 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-96 bg-gradient-to-b from-purple-50 to-blue-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={onToggleCollapse}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Without an API key, AI responses will be simulated for demo purposes.
            </p>
          </div>
        )}

        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('assistant')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'assistant' 
                ? 'bg-white text-purple-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI</span>
          </button>
          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'notes' 
                ? 'bg-white text-purple-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Notes</span>
          </button>
          <button 
            onClick={() => setActiveTab('research')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'research' 
                ? 'bg-white text-purple-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Research</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'assistant' && (
          <>
            {/* Quick Actions */}
            <div className="p-4 space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Quick Actions</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    className="flex items-center space-x-3 w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-purple-600">{action.icon}</div>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversations.map((conv) => (
                <div key={conv.id} className={`flex ${conv.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-3 rounded-lg relative group ${
                    conv.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : conv.type === 'system'
                      ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    {conv.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{conv.message}</p>
                        {conv.type === 'ai' && conv.message && (
                          <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyToClipboard(conv.message)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => insertContent(conv.message)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                              title="Insert into document"
                            >
                              <FileText className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask AI for help..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !prompt.trim()}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'notes' && (
          <div className="flex-1 p-4">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Document Notes</h4>
              <textarea
                value={currentDocument?.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder={currentDocument ? `Add notes for "${currentDocument.name}"...` : 'Select a document to add notes...'}
                disabled={!currentDocument}
                className="w-full h-64 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Document Info</h4>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Current Document:</strong> {currentDocument?.name || 'None selected'}
                </p>
                {currentDocument?.content && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Word Count:</strong> {currentDocument.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length}
                  </p>
                )}
                {currentDocument?.notes && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Notes:</strong> {currentDocument.notes.length} characters
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'research' && (
          <div className="flex-1 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Research Materials</h4>
            
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-1">Character Backgrounds</h5>
                <p className="text-sm text-gray-600">Detailed profiles and motivations</p>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-1">World Building</h5>
                <p className="text-sm text-gray-600">Maps, cultures, and histories</p>
              </div>
              
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-1">Plot Outlines</h5>
                <p className="text-sm text-gray-600">Story structure and key events</p>
              </div>
            </div>

            <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-purple-300 hover:text-purple-600 transition-colors">
              + Add Research Material
            </button>
          </div>
        )}
      </div>
    </div>
  );
}