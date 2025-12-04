import React from 'react';
import { IssueNode } from '../types';
import NodeItem from './NodeItem';

interface TreeRendererProps {
  node: IssueNode;
  onAddChild: (parentId: string) => void;
  onAddSibling: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, content: string) => void;
  depth?: number;
}

const TreeRenderer: React.FC<TreeRendererProps> = ({
  node,
  onAddChild,
  onAddSibling,
  onDelete,
  onUpdate,
  depth = 0
}) => {
  
  return (
    <div className="flex items-center">
      {/* Render Current Node */}
      <div className="flex-shrink-0 z-10 relative">
         <NodeItem 
            node={node} 
            depth={depth}
            onAddChild={onAddChild} 
            onAddSibling={onAddSibling}
            onDelete={onDelete} 
            onUpdate={onUpdate}
         />
      </div>

      {/* Render Children Recursively */}
      {node.children.length > 0 && (
        <div className="flex flex-col ml-24 relative">
            
            {/* 
               Group Connector: Line from Parent (Right Edge) to the Spine.
            */}
            <div className="absolute top-1/2 -left-24 w-12 h-px bg-neutral-300" />

            {node.children.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === node.children.length - 1;
                const isOnly = node.children.length === 1;

                return (
                    <div key={child.id} className="relative flex items-center py-8">
                        {/* 
                           CONNECTORS:
                           The spine is at -left-12 (48px left of child).
                        */}

                        {isOnly ? (
                            // Single child: Straight line
                            <div className="absolute -left-12 w-12 h-px bg-neutral-300" />
                        ) : (
                            <>
                                {/* 
                                    Top Half Connector 
                                    - If it's the LAST child, it curves from Top to Right.
                                    - If it's the FIRST child, it should be hidden (no line above).
                                    - Otherwise (middle), it's a straight vertical line.
                                */}
                                <div className={`
                                    absolute -left-12 top-0 w-12 h-[calc(50%+1px)]
                                    ${isLast 
                                        ? 'border-l border-b rounded-bl-2xl border-neutral-300' 
                                        : (isFirst ? '' : 'border-l border-neutral-300')}
                                `} />

                                {/* 
                                    Bottom Half Connector
                                    - If it's the FIRST child, it curves from Bottom to Right.
                                    - Otherwise (if not last), it's a straight vertical line to bottom.
                                */}
                                <div className={`
                                    absolute -left-12 bottom-0 w-12 h-1/2
                                    ${isFirst 
                                        ? 'border-l border-t rounded-tl-2xl border-neutral-300' 
                                        : (!isLast ? 'border-l border-neutral-300' : '')}
                                `} />
                                
                                {/* 
                                    Horizontal Extension for Middle Children
                                    (First and Last are handled by the borders above)
                                */}
                                {!isFirst && !isLast && (
                                    <div className="absolute -left-12 top-1/2 w-12 h-px bg-neutral-300" />
                                )}
                            </>
                        )}
                        
                        <TreeRenderer
                            node={child}
                            onAddChild={onAddChild}
                            onAddSibling={onAddSibling}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            depth={depth + 1}
                        />
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default TreeRenderer;