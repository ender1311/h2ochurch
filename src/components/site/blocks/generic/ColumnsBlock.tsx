import type { ReactNode } from "react";

export type ColumnsBlockProps = {
  left: ReactNode;
  right: ReactNode;
};

export function ColumnsBlock({ left, right }: ColumnsBlockProps) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-4">
      <div className="grid gap-8 md:grid-cols-2">
        <div>{left}</div>
        <div>{right}</div>
      </div>
    </div>
  );
}
