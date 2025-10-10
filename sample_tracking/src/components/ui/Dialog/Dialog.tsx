import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import * as RadixDialog from "@radix-ui/react-dialog";
import { twMerge } from "tailwind-merge";

const DialogContext = React.createContext<
  React.ComponentProps<typeof RadixDialog.Root>
>({});
const useDialogContext = () => React.useContext(DialogContext);

const DialogRoot = ({
  children,
  ...props
}: React.ComponentProps<typeof RadixDialog.Root>) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange: setOpen,
        ...props,
      }}
    >
      <RadixDialog.Root open={open} onOpenChange={setOpen} {...props}>
        {children}
      </RadixDialog.Root>
    </DialogContext.Provider>
  );
};

type DialogOverlayProps = React.ComponentProps<typeof motion.div>;
const DialogOverlay = ({
  children,
  className,
  ...props
}: DialogOverlayProps) => {
  const { open } = useDialogContext();

  return (
    <AnimatePresence>
      {open ? (
        <RadixDialog.Overlay forceMount asChild>
          <motion.div
            className={twMerge(
              "fixed inset-0 flex items-center justify-center p-5 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm",
              className
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            {...props}
          >
            {children}
          </motion.div>
        </RadixDialog.Overlay>
      ) : null}
    </AnimatePresence>
  );
};

type DialogContentProps = React.ComponentProps<typeof motion.div>;
const DialogContent = ({
  children,
  className,
  ...props
}: DialogContentProps) => {
  const { open } = useDialogContext();

  return (
    <AnimatePresence>
      {open ? (
        <RadixDialog.Content forceMount asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={twMerge("outline-none", className)}
            {...props}
          >
            {children}
          </motion.div>
        </RadixDialog.Content>
      ) : null}
    </AnimatePresence>
  );
};

type DialogPortalProps = React.ComponentProps<typeof RadixDialog.Portal>;
const DialogPortal = (props: DialogPortalProps) => {
  return <RadixDialog.Portal forceMount {...props} />;
};

const Dialog = {
  Root: DialogRoot,
  Portal: DialogPortal,
  Trigger: RadixDialog.Trigger,
  Overlay: DialogOverlay,
  Content: DialogContent,
};

export default Dialog;
