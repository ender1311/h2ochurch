import { Suspense } from "react";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Create account — H2O Hub" };

export default function AdminSignupPage() {
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
        <SignupForm />
      </Suspense>
    </main>
  );
}
