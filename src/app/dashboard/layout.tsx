import { Sidebar, Topbar } from "@/components/ui/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <div className="dash">
        <Sidebar />
        <main className="dash-main">{children}</main>
      </div>
    </>
  );
}
