import { APP_NAME } from "@/app/constants";
import DashboardClient from "./_components/dashboard-client";

export const metadata = {
  title: `Dashboard | ${APP_NAME}`,
};

export default function DashboardPage() {
  return <DashboardClient />;
}
