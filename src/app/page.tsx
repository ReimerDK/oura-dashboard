import { signIn } from "@/lib/auth";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="max-w-sm w-full mx-auto px-6 py-12 bg-gray-900 rounded-3xl text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Oura Dashboard</h1>
          <p className="mt-2 text-gray-400 text-sm">Se dine helbredsdata fra Oura Ring</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("oura", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Log ind med Oura
          </button>
        </form>
      </div>
    </div>
  );
}
