import type { SlotComponent } from "@measured/puck";
import type { ReactNode } from "react";

export type ColumnsBlockProps = {
  left: SlotComponent | ReactNode;
  right: SlotComponent | ReactNode;
};

export function ColumnsBlock({ left, right }: ColumnsBlockProps) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-4">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {typeof left === "function" ? (left as SlotComponent)() : left}
        </div>
        <div>
          {typeof right === "function" ? (right as SlotComponent)() : right}
        </div>
      </div>
    </div>
  );
}
