import { useState, forwardRef, useImperativeHandle } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import styles from "./ImperativeToast.module.scss";
import { Button } from "@radix-ui/themes";

export interface ImperativeToastRef {
  publish: (message: string) => void;
}

export const ImperativeToast = forwardRef<ImperativeToastRef>((_, forwardedRef) => {
  // We'll store each toast message as a string in an array.
  const [toasts, setToasts] = useState<string[]>([]);

  useImperativeHandle(forwardedRef, () => ({
    publish: (message: string) => {
      // Add new toast message
      setToasts((prev) => [...prev, message]);
      // Automatically remove the toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 5000);
    },
  }));

  return (
    <ToastPrimitive.Provider swipeDirection="up">
      {toasts.map((message, index) => (
        <ToastPrimitive.Root className={styles.ToastRoot} key={index} open>
          <ToastPrimitive.Title className={styles.ToastTitle}>Upload Status</ToastPrimitive.Title>
          <ToastPrimitive.Description className={styles.ToastDescription}>{message}</ToastPrimitive.Description>
          <ToastPrimitive.Close className={styles.ToastClose} asChild>
            <Button>Dismiss</Button>
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className={styles.ToastViewport} />
    </ToastPrimitive.Provider>
  );
});
