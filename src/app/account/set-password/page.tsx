import { Suspense } from "react";
import { SetPasswordForm } from "./SetPasswordForm";

export const metadata = { title: "Set your password — H2O Hub" };

export default function SetPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 90% at 80% 0%, #1e9bd7 0%, #0e6ba0 34%, #0b3a52 64%, #06212e 100%)",
        }}
      />
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </main>
  );
}
