import React, { useState, useCallback } from 'react';
import { IssueNode } from './types';
import { INITIAL_TREE_DATA } from './constants';
import TreeRenderer from './components/TreeRenderer';
import { 
    Minus, 
    Plus, 
    Download, 
    RotateCcw,
    Share2
} from 'lucide-react';

const App: React.FC = () => {
  const [rootNode, setRootNode] = useState<IssueNode>(INITIAL_TREE_DATA);
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState({ isPanning: false, startX: 0, startY: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Initial offset

  // --- Tree Operations ---

  const findNode = useCallback((id: string, node: IssueNode): IssueNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(id, child);
      if (found) return found;
    }
    return null;
  }, []);

  const updateTree = useCallback((newRoot: IssueNode) => {
    setRootNode({ ...newRoot });
  }, []);

  const handleUpdateNode = (id: string, content: string) => {
    const clone = JSON.parse(JSON.stringify(rootNode));
    const target = findNode(id, clone);
    if (target) {
        target.content = content;
        updateTree(clone);
    }
  };

  const handleAddChild = (parentId: string) => {
    const clone = JSON.parse(JSON.stringify(rootNode));
    const parent = findNode(parentId, clone);
    if (parent) {
        const newChild: IssueNode = {
            id: crypto.randomUUID(),
            content: '', // Start empty so user can type immediately
            type: 'hypothesis',
            children: [],
            parentId: parentId,
            isExpanded: true
        };
        parent.children.push(newChild);
        parent.isExpanded = true;
        updateTree(clone);
    }
  };

  const handleAddSibling = (nodeId: string) => {
    if (nodeId === rootNode.id) return; // Root has no siblings in this structure

    const clone = JSON.parse(JSON.stringify(rootNode));
    // We need to find the parent of the node
    const targetNode = findNode(nodeId, clone);
    
    if (targetNode && targetNode.parentId) {
        const parent = findNode(targetNode.parentId, clone);
        if (parent) {
            const newSibling: IssueNode = {
                id: crypto.randomUUID(),
                content: '', // Start empty so user can type immediately
                type: targetNode.type, // Copy type from sibling
                children: [],
                parentId: parent.id,
                isExpanded: true
            };
            
            // Insert after the current node
            const index = parent.children.findIndex((c: IssueNode) => c.id === nodeId);
            if (index !== -1) {
                parent.children.splice(index + 1, 0, newSibling);
            } else {
                parent.children.push(newSibling);
            }
            updateTree(clone);
        }
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === rootNode.id) return; // Cannot delete root
    
    const clone = JSON.parse(JSON.stringify(rootNode));
    
    const deleteFromChildren = (node: IssueNode): boolean => {
        const idx = node.children.findIndex(c => c.id === nodeId);
        if (idx !== -1) {
            node.children.splice(idx, 1);
            return true;
        }
        return node.children.some(child => deleteFromChildren(child));
    };

    deleteFromChildren(clone);
    updateTree(clone);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rootNode, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "issue-tree.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Canvas Interaction ---

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        // Zoom
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setScale(s => Math.min(Math.max(0.2, s + delta), 2));
    } else {
        // Pan
        setPosition(p => ({
            x: p.x - e.deltaX,
            y: p.y - e.deltaY
        }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { 
        setPanning({ isPanning: true, startX: e.clientX - position.x, startY: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panning.isPanning) {
        setPosition({
            x: e.clientX - panning.startX,
            y: e.clientY - panning.startY
        });
    }
  };

  const handleMouseUp = () => {
    setPanning(prev => ({ ...prev, isPanning: false }));
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-50 font-sans text-neutral-900">
        {/* Header Toolbar */}
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 z-50 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">L</span>
                </div>
                <h1 className="font-semibold text-lg text-neutral-800 tracking-tight">Luminara Issue Tree</h1>
            </div>

            <div className="flex items-center gap-2">
                 <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors">
                    <Share2 size={14} />
                    Share
                 </button>
                 <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-sm transition-colors"
                 >
                    <Download size={14} />
                    Export JSON
                 </button>
            </div>
        </header>

        {/* Main Canvas Area */}
        <div 
            className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            
            <div 
                className="absolute origin-top-left transition-transform duration-75 ease-out"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
                }}
            >
                <TreeRenderer 
                    node={rootNode}
                    onAddChild={handleAddChild}
                    onAddSibling={handleAddSibling}
                    onDelete={handleDeleteNode}
                    onUpdate={handleUpdateNode}
                />
            </div>

            {/* Floating Controls */}
            <div 
                className="absolute bottom-8 right-8 flex flex-col gap-2 p-2 bg-white rounded-xl shadow-xl border border-neutral-200"
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking controls
            >
                <button onClick={() => setScale(s => Math.min(s + 0.1, 2))} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
                    <Plus size={20} />
                </button>
                <div className="h-px bg-neutral-200 w-full" />
                <button onClick={() => setScale(s => Math.max(s - 0.1, 0.2))} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
                    <Minus size={20} />
                </button>
                <div className="h-px bg-neutral-200 w-full" />
                <button onClick={() => { setPosition({x: 100, y: 100}); setScale(1); }} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600" title="Reset View">
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Helper text */}
            <div className="absolute bottom-8 left-8 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-neutral-200 text-xs text-neutral-500 font-medium shadow-sm pointer-events-none">
                Shortcuts: Enter (Sibling) • Tab (Child) • Backspace (Delete Empty)
            </div>
        </div>
    </div>
  );
};

export default App;