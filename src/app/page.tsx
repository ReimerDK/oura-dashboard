import { signIn } from "@/lib/auth";

export default function LandingPage() {
  return (
    <div className="sign-in-shell">
      <div className="sign-in-box">
        <div className="brand" style={{ justifyContent: "center", marginBottom: 24 }}>
          <div className="brand-mark" />
          Oura
        </div>
        <h1>
          A quiet companion<br />for the <em>body.</em>
        </h1>
        <p>Din personlige Oura Ring dashboard</p>
        <form
          action={async () => {
            "use server";
            await signIn("oura", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit" className="sign-in-btn">
            Log ind med Oura
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
