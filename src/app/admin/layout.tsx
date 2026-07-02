import { PropsWithChildren } from "react";
import { AdminLayout } from "~/components/AdminLayout";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}
