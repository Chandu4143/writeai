import React from 'react';
import { 
  Edit3, Trash2, Copy, FolderPlus, FileText, 
  Move, Archive, Star, MoreHorizontal 
} from 'lucide-react';

interface DocumentContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  documentType: 'document' | 'folder';
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCreateChild: (type: 'document' | 'folder') => void;
  onMove: () => void;
  onArchive: () => void;
  onToggleFavorite: () => void;
}

export default function DocumentContextMenu({
  isOpen,
  position,
  onClose,
  documentType,
  onRename,
  onDelete,
  onDuplicate,
  onCreateChild,
  onMove,
  onArchive,
  onToggleFavorite
}: DocumentContextMenuProps) {
  if (!isOpen) return null;

  const menuItems = [
    { icon: Edit3, label: 'Rename', action: onRename },
    { icon: Copy, label: 'Duplicate', action: onDuplicate },
    { icon: Star, label: 'Add to Favorites', action: onToggleFavorite },
    { type: 'separator' },
    ...(documentType === 'folder' ? [
      { icon: FileText, label: 'New Document', action: () => onCreateChild('document') },
      { icon: FolderPlus, label: 'New Folder', action: () => onCreateChild('folder') },
      { type: 'separator' }
    ] : []),
    { icon: Move, label: 'Move to...', action: onMove },
    { icon: Archive, label: 'Archive', action: onArchive },
    { type: 'separator' },
    { icon: Trash2, label: 'Delete', action: onDelete, danger: true }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48"
        style={{ 
          left: position.x, 
          top: position.y,
          transform: 'translate(-50%, 0)'
        }}
      >
        {menuItems.map((item, index) => {
          if (item.type === 'separator') {
            return <div key={index} className="h-px bg-gray-200 my-1" />;
          }

          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                item.action();
                onClose();
              }}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}