import React, { useState, useRef, useEffect } from 'react';
import { IssueNode } from '../types';
import { getNodeStyle, getDepthLabel } from '../constants';
import { 
  Plus, 
  Trash2, 
  HelpCircle,
  Target,
  Layers
} from 'lucide-react';

interface NodeItemProps {
  node: IssueNode;
  depth: number;
  onAddChild: (parentId: string) => void;
  onAddSibling: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, content: string) => void;
}

const NodeItem: React.FC<NodeItemProps> = ({ 
  node, 
  depth,
  onAddChild,
  onAddSibling,
  onDelete, 
  onUpdate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus new nodes (empty content)
  useEffect(() => {
    if (!node.content && node.type !== 'root') {
        setIsEditing(true);
    }
  }, []); // Run once on mount

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Reset height to auto to recalculate correctly
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard Shortcuts for Power Users
    
    // Enter -> Add Sibling (if not holding shift for newline)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (node.type !== 'root') {
        onAddSibling(node.id);
      }
      setIsEditing(false);
    }

    // Tab -> Add Child
    if (e.key === 'Tab') {
      e.preventDefault();
      onAddChild(node.id);
      setIsEditing(false);
    }

    // Backspace -> Delete if empty (and not root)
    if (e.key === 'Backspace' && node.content === '' && !isRoot) {
        e.preventDefault();
        onDelete(node.id);
    }
  };

  const getNodeIcon = (type: string) => {
    switch(type) {
        case 'question': return <HelpCircle className="w-3 h-3 mr-1 opacity-50" />;
        case 'action': return <Target className="w-3 h-3 mr-1 opacity-50" />;
        default: return <Layers className="w-3 h-3 mr-1 opacity-50" />;
    }
  };

  const isRoot = node.type === 'root';
  const depthLabel = getDepthLabel(depth);
  const nodeStyles = getNodeStyle(node.type, depth);

  const placeholderText = depth === 0 ? "Define the problem..." : 
                          depth === 1 ? "Add a key driver..." : 
                          depth === 2 ? "Add a sub-issue..." : "Add analysis...";

  return (
    <div 
      className="relative flex flex-col items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => e.stopPropagation()} // Prevent canvas panning when clicking on node
    >
      {/* Card Container */}
      <div 
        className={`
          relative z-20 flex flex-col w-72 rounded-lg border
          ${nodeStyles}
        `}
      >
        <div className="flex flex-col p-4 min-h-[7rem] justify-between">
            
            {/* Header / Type Label */}
            <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-[10px] font-bold uppercase tracking-widest opacity-50 select-none">
                {getNodeIcon(node.type)}
                <span className="mr-1">L{depth}</span> • <span className="ml-1">{depthLabel}</span>
            </div>
            
            <div className="flex items-center gap-1">
                {/* Delete Button (Visible on Hover) */}
                {!isRoot && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(node.id);
                    }}
                    className={`p-1 rounded hover:bg-red-100 text-red-500 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    title="Delete Node (Backspace)"
                >
                    <Trash2 size={12} />
                </button>
                )}
            </div>
            </div>

            {/* Content Area */}
            {isEditing ? (
            <textarea
                ref={inputRef}
                value={node.content}
                onChange={(e) => {
                    onUpdate(node.id, e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={() => setIsEditing(false)}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                className="w-full bg-transparent resize-none outline-none text-sm font-medium leading-relaxed overflow-hidden placeholder:text-neutral-300"
                rows={1}
            />
            ) : (
            <div 
                onClick={() => setIsEditing(true)}
                className={`text-sm font-medium leading-relaxed cursor-text break-words ${!node.content ? 'text-neutral-400 italic' : ''}`}
                title="Click to edit"
            >
                {node.content || placeholderText}
            </div>
            )}
        </div>
      </div>

      {/* 
         INTERACTION BUTTONS 
      */}

      {/* 1. ADD CHILD (Right Side) */}
      <div className={`
        absolute left-full top-1/2 -translate-y-1/2 z-30
        transition-all duration-300 ease-in-out pl-2
        ${isHovered ? 'opacity-100 translate-x-0 visible delay-0' : 'opacity-0 -translate-x-2 invisible delay-500'}
      `}>
        <button
            onClick={() => onAddChild(node.id)}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-900 text-white border border-neutral-700 shadow-lg hover:bg-black hover:scale-110 transition-transform"
            title="Add Child (Tab)"
        >
            <Plus size={16} />
        </button>
      </div>

      {/* 2. ADD SIBLING (Bottom Side) - Not available for Root */}
      {!isRoot && (
         <div className={`
            absolute top-full left-1/2 -translate-x-1/2 z-30
            transition-all duration-300 ease-in-out pt-2
            ${isHovered ? 'opacity-100 translate-y-0 visible delay-0' : 'opacity-0 -translate-y-2 invisible delay-500'}
         `}>
            <button
                onClick={() => onAddSibling(node.id)}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-900 text-white border border-neutral-700 shadow-lg hover:bg-black hover:scale-110 transition-transform"
                title="Add Sibling (Enter)"
            >
                <Plus size={16} />
            </button>
         </div>
      )}

    </div>
  );
};

export default NodeItem;