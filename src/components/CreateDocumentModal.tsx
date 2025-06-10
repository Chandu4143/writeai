import React, { useState } from 'react';
import { X, FileText, Folder, Sparkles } from 'lucide-react';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (name: string, type: 'document' | 'folder', useAI?: boolean) => void;
  parentFolder?: string;
}

export default function CreateDocumentModal({
  isOpen,
  onClose,
  onCreateDocument,
  parentFolder
}: CreateDocumentModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'document' | 'folder'>('document');
  const [useAI, setUseAI] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateDocument(name.trim(), type, useAI);
      setName('');
      setType('document');
      setUseAI(false);
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setType('document');
    setUseAI(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New {type === 'document' ? 'Document' : 'Folder'}
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setType('document')}
              className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                type === 'document'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Document</span>
            </button>
            <button
              type="button"
              onClick={() => setType('folder')}
              className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                type === 'folder'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Folder className="w-5 h-5" />
              <span className="font-medium">Folder</span>
            </button>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${type} name...`}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {type === 'document' && (
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <input
                type="checkbox"
                id="useAI"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="useAI" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Generate content with AI</span>
              </label>
            </div>
          )}

          {parentFolder && (
            <div className="text-sm text-gray-600">
              Creating in: <span className="font-medium">{parentFolder}</span>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create {type === 'document' ? 'Document' : 'Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}