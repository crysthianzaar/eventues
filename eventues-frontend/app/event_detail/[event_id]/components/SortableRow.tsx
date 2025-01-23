// components/OrganizatorEventDetails/SortableRow.tsx

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableRow, TableCell } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
}

const SortableRow: React.FC<SortableRowProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // Adiciona uma sombra quando está sendo arrastado
    boxShadow: isDragging ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
    backgroundColor: isDragging ? '#f0f0f0' : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </TableRow>
  );
};

export default SortableRow;
