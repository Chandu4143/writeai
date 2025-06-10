import React from 'react';
import { X, FileText, BookOpen, Briefcase, GraduationCap, Heart, Zap } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  aiFeatures: string[];
}

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateGallery({ isOpen, onClose, onSelectTemplate }: TemplateGalleryProps) {
  const templates: Template[] = [
    {
      id: 'novel',
      name: 'Novel',
      description: 'Full-length fiction with chapter structure',
      icon: <BookOpen className="w-6 h-6" />,
      category: 'Fiction',
      aiFeatures: ['Character development', 'Plot assistance', 'Dialogue enhancement']
    },
    {
      id: 'screenplay',
      name: 'Screenplay',
      description: 'Film and TV script formatting',
      icon: <FileText className="w-6 h-6" />,
      category: 'Scripts',
      aiFeatures: ['Scene structure', 'Character arcs', 'Dialogue polish']
    },
    {
      id: 'business-plan',
      name: 'Business Plan',
      description: 'Comprehensive business strategy document',
      icon: <Briefcase className="w-6 h-6" />,
      category: 'Business',
      aiFeatures: ['Market analysis', 'Financial projections', 'Executive summary']
    },
    {
      id: 'thesis',
      name: 'Academic Thesis',
      description: 'Research paper with citations',
      icon: <GraduationCap className="w-6 h-6" />,
      category: 'Academic',
      aiFeatures: ['Literature review', 'Citation management', 'Methodology']
    },
    {
      id: 'memoir',
      name: 'Memoir',
      description: 'Personal life story narrative',
      icon: <Heart className="w-6 h-6" />,
      category: 'Non-fiction',
      aiFeatures: ['Story structure', 'Emotional depth', 'Timeline organization']
    },
    {
      id: 'technical-manual',
      name: 'Technical Manual',
      description: 'Step-by-step instructional guide',
      icon: <Zap className="w-6 h-6" />,
      category: 'Technical',
      aiFeatures: ['Process optimization', 'Clarity enhancement', 'User-friendly language']
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Gallery</h2>
            <p className="text-gray-600 mt-1">Choose a template to get started with AI assistance</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div 
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg text-purple-600 group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span className="text-sm text-purple-600 font-medium">{template.category}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{template.description}</p>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span>AI Features</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {template.aiFeatures.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Custom AI Template</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Don't see what you need? Create a custom template with AI assistance tailored to your specific project requirements.
            </p>
            <button 
              onClick={() => onSelectTemplate('custom')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Create Custom Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}