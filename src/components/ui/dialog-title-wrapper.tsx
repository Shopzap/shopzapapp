
import React from 'react';
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface DialogTitleWrapperProps {
  children: React.ReactNode;
  hidden?: boolean;
}

export const DialogTitleWrapper: React.FC<DialogTitleWrapperProps> = ({ 
  children, 
  hidden = false 
}) => {
  if (hidden) {
    return (
      <VisuallyHidden asChild>
        <DialogTitle>{children}</DialogTitle>
      </VisuallyHidden>
    );
  }
  
  return <DialogTitle>{children}</DialogTitle>;
};
