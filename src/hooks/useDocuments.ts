import { useState, useCallback } from 'react';

export interface Document {
  id: string;
  name: string;
  type: 'document' | 'folder';
  children?: Document[];
  wordCount?: number;
  content?: string;
  title?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 'draft',
      name: 'Draft',
      type: 'folder',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      children: [
        { 
          id: 'chapter-1', 
          name: 'Chapter 1: The Beginning', 
          type: 'document', 
          wordCount: 1250, 
          content: 'The world had changed overnight, though nobody seemed to notice. Sarah walked through the empty streets, her footsteps echoing against the silent buildings. The morning sun cast long shadows across the pavement, but something felt different—wrong, even.\n\nShe paused at the corner of Fifth and Main, the same intersection she\'d crossed every day for the past three years on her way to work. The traffic light cycled through its colors, but there were no cars to obey its commands. No pedestrians hurried past with coffee cups and worried expressions. Just silence.\n\nSarah pulled out her phone, the screen lighting up with a dozen missed calls from her sister. Her thumb hovered over the callback button, but something made her hesitate. In the distance, she could hear what sounded like... singing? A low, melodic hum that seemed to come from everywhere and nowhere at once.\n\nThat\'s when she noticed the birds. Or rather, the complete absence of them. No pigeons pecking at crumbs, no sparrows chirping from the telephone wires. Even the ever-present seagulls that usually fought over scraps near the harbor were gone.\n\nThe singing grew louder.', 
          title: 'Chapter 1: The Beginning',
          notes: '',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-15'),
          parentId: 'draft'
        },
        { 
          id: 'chapter-2', 
          name: 'Chapter 2: Discovery', 
          type: 'document', 
          wordCount: 980, 
          content: '', 
          title: 'Chapter 2: Discovery',
          notes: '',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
          parentId: 'draft'
        },
        { 
          id: 'chapter-3', 
          name: 'Chapter 3: Revelation', 
          type: 'document', 
          wordCount: 0, 
          content: '', 
          title: 'Chapter 3: Revelation',
          notes: '',
          createdAt: new Date('2024-01-04'),
          updatedAt: new Date('2024-01-04'),
          parentId: 'draft'
        }
      ]
    },
    {
      id: 'research',
      name: 'Research',
      type: 'folder',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      children: [
        { 
          id: 'characters', 
          name: 'Character Profiles', 
          type: 'document', 
          wordCount: 450, 
          content: '# Main Characters\n\n## Sarah Chen\n- Age: 28\n- Occupation: Data Analyst\n- Background: Grew up in suburban Portland, moved to the city for work\n- Personality: Observant, analytical, tends to overthink situations\n- Key traits: Always notices details others miss, has a habit of humming when nervous\n\n## Marcus Rivera\n- Age: 34\n- Occupation: Emergency Room Doctor\n- Background: First-generation immigrant, worked his way through medical school\n- Personality: Calm under pressure, natural leader, protective of others\n- Key traits: Keeps a small notebook for jotting down observations, speaks three languages\n\n## Elena Vasquez\n- Age: 19\n- Occupation: College student (Art major)\n- Background: Local to the city, lives with her grandmother\n- Personality: Creative, intuitive, sees patterns in chaos\n- Key traits: Always carries a sketchbook, has synesthesia (sees sounds as colors)', 
          title: 'Character Profiles',
          notes: '',
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-10'),
          parentId: 'research'
        },
        { 
          id: 'worldbuilding', 
          name: 'World Building Notes', 
          type: 'document', 
          wordCount: 320, 
          content: '# Setting: New Harbor City\n\n## Geography\n- Coastal city, population ~500,000\n- Built around a natural harbor\n- Mix of historic downtown and modern suburbs\n- Key locations: Harbor District, University Quarter, Old Town, Industrial Zone\n\n## The Phenomenon\n- Started at dawn on a Tuesday in March\n- Affects all living creatures except humans\n- No electronic interference, but subtle changes in behavior patterns\n- Seems to emanate from the harbor area\n\n## Timeline\n- Day 1: Animals disappear, strange singing begins\n- Day 2: Plants begin to change color\n- Day 3: The singing becomes more complex\n- Day 7: First human behavioral changes observed', 
          title: 'World Building Notes',
          notes: '',
          createdAt: new Date('2024-01-06'),
          updatedAt: new Date('2024-01-12'),
          parentId: 'research'
        }
      ]
    },
    {
      id: 'outline',
      name: 'Story Outline',
      type: 'document',
      wordCount: 180,
      content: '# Three-Act Structure\n\n## Act I: Setup (Chapters 1-3)\n- Introduce Sarah and the empty world\n- Discovery of other survivors\n- Establishment of the mystery\n\n## Act II: Confrontation (Chapters 4-8)\n- Investigation into the phenomenon\n- Character development and relationships\n- Rising tension and obstacles\n- Discovery of the source\n\n## Act III: Resolution (Chapters 9-12)\n- Final confrontation\n- Character arcs complete\n- Resolution of the mystery\n- New world order established',
      title: 'Story Outline',
      notes: '',
      createdAt: new Date('2024-01-07'),
      updatedAt: new Date('2024-01-08')
    }
  ]);

  const findDocument = useCallback((id: string, docs: Document[] = documents): Document | null => {
    for (const doc of docs) {
      if (doc.id === id) return doc;
      if (doc.children) {
        const found = findDocument(id, doc.children);
        if (found) return found;
      }
    }
    return null;
  }, [documents]);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    const updateInTree = (docs: Document[]): Document[] => {
      return docs.map(doc => {
        if (doc.id === id) {
          return { ...doc, ...updates, updatedAt: new Date() };
        }
        if (doc.children) {
          return { ...doc, children: updateInTree(doc.children) };
        }
        return doc;
      });
    };

    setDocuments(updateInTree(documents));
  }, [documents]);

  const createDocument = useCallback((name: string, type: 'document' | 'folder', parentId?: string) => {
    const newDoc: Document = {
      id: `${type}-${Date.now()}`,
      name,
      type,
      content: type === 'document' ? '' : undefined,
      title: type === 'document' ? name : undefined,
      notes: type === 'document' ? '' : undefined,
      wordCount: type === 'document' ? 0 : undefined,
      children: type === 'folder' ? [] : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId
    };

    if (parentId) {
      const updateInTree = (docs: Document[]): Document[] => {
        return docs.map(doc => {
          if (doc.id === parentId && doc.type === 'folder') {
            return {
              ...doc,
              children: [...(doc.children || []), newDoc],
              updatedAt: new Date()
            };
          }
          if (doc.children) {
            return { ...doc, children: updateInTree(doc.children) };
          }
          return doc;
        });
      };
      setDocuments(updateInTree(documents));
    } else {
      setDocuments([...documents, newDoc]);
    }

    return newDoc.id;
  }, [documents]);

  const deleteDocument = useCallback((id: string) => {
    const removeFromTree = (docs: Document[]): Document[] => {
      return docs.filter(doc => {
        if (doc.id === id) return false;
        if (doc.children) {
          doc.children = removeFromTree(doc.children);
        }
        return true;
      });
    };

    setDocuments(removeFromTree(documents));
  }, [documents]);

  const moveDocument = useCallback((id: string, newParentId?: string) => {
    const doc = findDocument(id);
    if (!doc) return;

    // Remove from current location
    deleteDocument(id);

    // Add to new location
    const docWithNewParent = { ...doc, parentId: newParentId };
    
    if (newParentId) {
      const updateInTree = (docs: Document[]): Document[] => {
        return docs.map(d => {
          if (d.id === newParentId && d.type === 'folder') {
            return {
              ...d,
              children: [...(d.children || []), docWithNewParent],
              updatedAt: new Date()
            };
          }
          if (d.children) {
            return { ...d, children: updateInTree(d.children) };
          }
          return d;
        });
      };
      setDocuments(prev => updateInTree(prev));
    } else {
      setDocuments(prev => [...prev, docWithNewParent]);
    }
  }, [findDocument, deleteDocument]);

  const getDocumentStats = useCallback(() => {
    const countStats = (docs: Document[]): { documents: number; folders: number; totalWords: number } => {
      let documents = 0;
      let folders = 0;
      let totalWords = 0;

      docs.forEach(doc => {
        if (doc.type === 'document') {
          documents++;
          totalWords += doc.wordCount || 0;
        } else {
          folders++;
          if (doc.children) {
            const childStats = countStats(doc.children);
            documents += childStats.documents;
            folders += childStats.folders;
            totalWords += childStats.totalWords;
          }
        }
      });

      return { documents, folders, totalWords };
    };

    return countStats(documents);
  }, [documents]);

  return {
    documents,
    findDocument,
    updateDocument,
    createDocument,
    deleteDocument,
    moveDocument,
    getDocumentStats
  };
}