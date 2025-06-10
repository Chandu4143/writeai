import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, FileText, Folder, Plus, MoreVertical, 
  BookOpen, Users, Lightbulb, Search, Filter, Star, Clock, X
} from 'lucide-react';
import DocumentContextMenu from './DocumentContextMenu';
import CreateDocumentModal from './CreateDocumentModal';

interface Document {
  id: string;
  name: string;
  type: 'document' | 'folder';
  children?: Document[];
  wordCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectNavigatorProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onDocumentSelect: (id: string) => void;
  onDocumentCreate: (name: string, type: 'document' | 'folder', parentId?: string, useAI?: boolean) => void;
  onDocumentUpdate: (id: string, updates: Partial<Document>) => void;
  onDocumentDelete: (id: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export default function ProjectNavigator({ 
  documents, 
  selectedDocumentId, 
  onDocumentSelect, 
  onDocumentCreate,
  onDocumentUpdate,
  onDocumentDelete,
  searchQuery,
  onSearchQueryChange
}: ProjectNavigatorProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['draft', 'research']));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | undefined>();
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    documentId: string;
    documentType: 'document' | 'folder';
  }>({ isOpen: false, position: { x: 0, y: 0 }, documentId: '', documentType: 'document' });

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const handleContextMenu = (e: React.MouseEvent, doc: Document) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      documentId: doc.id,
      documentType: doc.type
    });
  };

  const handleCreateDocument = (name: string, type: 'document' | 'folder', useAI?: boolean) => {
    onDocumentCreate(name, type, createParentId, useAI);
    setCreateParentId(undefined);
  };

  const filterDocuments = (docs: Document[], query: string): Document[] => {
    if (!query) return docs;
    
    return docs.filter(doc => {
      const matchesName = doc.name.toLowerCase().includes(query.toLowerCase());
      const hasMatchingChildren = doc.children ? filterDocuments(doc.children, query).length > 0 : false;
      return matchesName || hasMatchingChildren;
    }).map(doc => ({
      ...doc,
      children: doc.children ? filterDocuments(doc.children, query) : undefined
    }));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderDocumentTree = (docs: Document[], level = 0) => {
    const filteredDocs = filterDocuments(docs, searchQuery);
    
    return filteredDocs.map((doc) => (
      <div key={doc.id} className={`ml-${level * 4}`}>
        <div 
          className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedDocumentId === doc.id 
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm' 
              : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
          }`}
          onClick={() => doc.type === 'document' ? onDocumentSelect(doc.id) : toggleFolder(doc.id)}
          onContextMenu={(e) => handleContextMenu(e, doc)}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {doc.type === 'folder' ? (
              <>
                {expandedFolders.has(doc.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
              </>
            ) : (
              <>
                <div className="w-4 h-4 flex-shrink-0"></div>
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {searchQuery ? (
                  <span dangerouslySetInnerHTML={{
                    __html: doc.name.replace(
                      new RegExp(`(${searchQuery})`, 'gi'),
                      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                    )
                  }} />
                ) : (
                  doc.name
                )}
              </div>
              {doc.type === 'document' && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDate(doc.updatedAt)} • {doc.wordCount || 0} words
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {doc.wordCount && doc.wordCount > 0 && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, doc);
              }}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <MoreVertical className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
        
        {doc.type === 'folder' && doc.children && expandedFolders.has(doc.id) && (
          <div className="ml-4 mt-1">
            {renderDocumentTree(doc.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const hasSearchResults = searchQuery && filterDocuments(documents, searchQuery).length > 0;
  const noSearchResults = searchQuery && filterDocuments(documents, searchQuery).length === 0;

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Project Navigator</h2>
          <button 
            onClick={() => {
              setCreateParentId(undefined);
              setShowCreateModal(true);
            }}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchQueryChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {hasSearchResults ? `Found ${filterDocuments(documents, searchQuery).length} result(s)` : 'No results found'}
              </span>
              <button
                onClick={() => onSearchQueryChange('')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        
        {!searchQuery && (
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <BookOpen className="w-4 h-4" />
              <span>Draft</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Lightbulb className="w-4 h-4" />
              <span>Research</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {noSearchResults ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No documents found for "{searchQuery}"</p>
            <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          renderDocumentTree(documents)
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>3 collaborators online</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Synced</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <FileText className="w-3 h-3" />
            <span>{documents.reduce((acc, doc) => acc + (doc.children?.length || 0) + (doc.type === 'document' ? 1 : 0), 0)} docs</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Last sync: 2m ago</span>
          </div>
        </div>
      </div>

      <DocumentContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        documentType={contextMenu.documentType}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onRename={() => console.log('Rename', contextMenu.documentId)}
        onDelete={() => {
          onDocumentDelete(contextMenu.documentId);
          setContextMenu(prev => ({ ...prev, isOpen: false }));
        }}
        onDuplicate={() => console.log('Duplicate', contextMenu.documentId)}
        onCreateChild={(type) => {
          setCreateParentId(contextMenu.documentId);
          setShowCreateModal(true);
        }}
        onMove={() => console.log('Move', contextMenu.documentId)}
        onArchive={() => console.log('Archive', contextMenu.documentId)}
        onToggleFavorite={() => console.log('Toggle favorite', contextMenu.documentId)}
      />

      <CreateDocumentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDocument={handleCreateDocument}
        parentFolder={createParentId ? documents.find(d => d.id === createParentId)?.name : undefined}
      />
    </div>
  );
}