
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, X } from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';

interface InvoicePreviewModalProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const InvoicePreviewModal = ({ order, open, onClose, onDownload }: InvoicePreviewModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Invoice Preview - #{order.id.slice(-8)}</DialogTitle>
            <div className="flex gap-2">
              <Button onClick={onDownload} size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <Separator className="my-4" />
        
        <div className="bg-white">
          <InvoiceTemplate order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewModal;
