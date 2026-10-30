import { SiteShell } from "@/components/SiteShell";
import { LoginForm } from "@/features/auth/ui/LoginForm";
export default function Login() {
  return (
    <SiteShell>
      <div className="flex justify-center py-8">
        <LoginForm />
      </div>
    </SiteShell>
  );
}
