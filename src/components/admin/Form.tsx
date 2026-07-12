const inputCls =
  "mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 text-ink outline-none transition-colors focus:border-brand placeholder:text-ink/30";
const labelCls = "block text-xs font-bold uppercase tracking-widest text-ink/50";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        required={required}
        className={inputCls}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <select name={name} defaultValue={defaultValue ?? undefined} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-full bg-brand px-7 py-3 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water"
    >
      {children}
    </button>
  );
}
