"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function Modal({
  open,
  title,
  description,
  panelClassName,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  description?: string;
  panelClassName?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-slate-950/45 px-4 py-10 backdrop-blur-md"
          onClick={onClose}
        >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl",
            "cursor-default",
            panelClassName
          )}
          onClick={(event) => event.stopPropagation()}
        >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  {title}
                </h2>
                {description ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
              <Button variant="ghost" size="sm" className="px-3" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
