"use client";

import { useState, Children, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CollapsibleList({
  children,
  pageSize = 3,
}: {
  children: ReactNode;
  pageSize?: number;
}) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(pageSize);
  const visible = items.slice(0, shown);
  const remaining = items.length - shown;

  return (
    <>
      {visible}
      {remaining > 0 && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShown((s) => s + pageSize)}
          >
            Show more ({remaining})
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}
