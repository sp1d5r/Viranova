import React, { useState } from 'react';
import { Button, ButtonProps } from './button';
import { useUser } from '../../contexts/UserProvider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./alert-dialog";
import { useToast } from "./use-toast";

interface CreditButtonProps extends ButtonProps {
  creditCost?: number;
  confirmationMessage?: string;
  onCreditDeduction?: () => void;
}

export const CreditButton: React.FC<CreditButtonProps> = ({
                                                            creditCost,
                                                            confirmationMessage,
                                                            onCreditDeduction,
                                                            onClick,
                                                            ...buttonProps
                                                          }) => {
  const { userData, updateUserData } = useUser();
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (creditCost && userData?.credits) {
      if (userData.credits.current < creditCost) {
        toast({
          title: "Insufficient Credits",
          description: `You need ${creditCost} credits for this action. Your current balance is ${userData.credits.current} credits.`,
          variant: "destructive",
        });
        return;
      }

      if (confirmationMessage) {
        setIsConfirmOpen(true);
        return;
      }
    }

    if (onClick) onClick(event);
  };

  const isDisabled = creditCost ? (userData?.credits?.current ?? 0) < creditCost : false;

  const buttonContent = (
    <Button
      {...buttonProps}
      onClick={handleClick}
      disabled={isDisabled || buttonProps.disabled}
    />
  );

  if (confirmationMessage) {
    return (
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogTrigger asChild>
          {buttonContent}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={"text-white"}>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>{confirmationMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (onClick) onClick({} as React.MouseEvent<HTMLButtonElement, MouseEvent>);
              setIsConfirmOpen(false);
            }}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return buttonContent;
};
