
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard!");
  });
};

const toastErrorWithCopy = (title: string, error: unknown) => {
    const description = error instanceof Error ? error.message : typeof error === 'string' ? error : 'An unknown error occurred.';
    const fullErrorText = `Error: ${title}\n\nDetails: ${description}`;
    toast.error(title, {
        description: description,
        action: {
            label: "Copy Error",
            onClick: () => copyToClipboard(fullErrorText),
        },
    });
};


export { Toaster, toast, toastErrorWithCopy }
