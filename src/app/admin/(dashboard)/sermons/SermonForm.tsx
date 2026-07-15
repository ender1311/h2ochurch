import { Field, TextArea, SubmitButton } from "@/components/admin/Form";

export function SermonForm({ action }: { action: (fd: FormData) => Promise<void> }) {
  return (
    <form action={action} className="rounded-3xl border border-ink/10 bg-cream p-8">
      <div className="grid gap-5">
        <Field label="Title" name="title" placeholder="e.g. Grace That Moves Us" required />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Speaker" name="speaker" placeholder="e.g. Pastor's name" />
          <Field label="Series" name="series" placeholder="e.g. The Real Gospel" />
          <Field label="Scripture" name="scripture" placeholder="e.g. Romans 1:1–17" />
          <Field label="Preached on" name="preached_on" type="date" />
        </div>

        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-widest text-ink/50">
            Audio file
          </span>
          <input
            name="audio"
            type="file"
            accept="audio/*"
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 text-ink outline-none transition-colors file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-cream focus:border-brand"
          />
          <span className="mt-1 block text-xs text-ink/40">
            Upload an MP3/M4A, or paste a link below instead.
          </span>
        </label>
        <Field label="Audio URL (optional)" name="audio_url" placeholder="https://…" />

        <TextArea label="Description" name="description" rows={5} placeholder="What was this message about?" />

        <label className="flex items-center gap-3 text-sm font-semibold text-ink">
          <input type="checkbox" name="published" className="h-5 w-5 rounded border-ink/30 text-brand" />
          Publish to the website now
        </label>
      </div>
      <div className="mt-6">
        <SubmitButton>Save sermon</SubmitButton>
      </div>
    </form>
  );
}
