import Link from "next/link";

export type ButtonBlockProps = {
  label: string;
  href: string;
  style: "solid" | "outline";
};

export function ButtonBlock({ label, href, style }: ButtonBlockProps) {
  const baseClass =
    "inline-block px-9 py-4 text-sm font-bold uppercase tracking-widest transition-colors";
  const solidClass =
    "bg-brand text-white hover:bg-brand/90";
  const outlineClass =
    "border border-brand text-brand hover:bg-brand hover:text-white";

  return (
    <div className="mx-auto max-w-4xl px-5 py-4 flex justify-center">
      <Link href={href} className={`${baseClass} ${style === "solid" ? solidClass : outlineClass}`}>
        {label}
      </Link>
    </div>
  );
}
