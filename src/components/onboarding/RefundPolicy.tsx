import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

interface RefundPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-white">
        <DialogHeader>
          <DialogTitle>Refund Policy</DialogTitle>
          <DialogDescription>Please read our refund policy carefully</DialogDescription>
        </DialogHeader>
        <ScrollArea className="mt-2 h-[300px] pr-4">
          <div className="space-y-4 text-sm">
            <p>As a solo developer, we have a limited refund policy:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Refunds are only considered if you have used the platform to create a minimum of 10% of the shorts allocated in your subscription tier.</li>
              <li>You must have reported any issues or bugs you've encountered through our official bug reporting system.</li>
              <li>If a refund is approved, the maximum refund amount is 50% of the total purchase cost.</li>
              <li>Refund requests will be manually reviewed, taking into account the reported issues and your usage of the platform.</li>
              <li>We reserve the right to deny refund requests if the above conditions are not met or if we determine the service has been used satisfactorily.</li>
            </ul>
            <p>By subscribing to our service, you acknowledge and agree to this refund policy.</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};