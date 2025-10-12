import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

export default function InviteCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="container mx-auto py-16 flex items-center justify-center min-h-[60vh]">
      <Card className={`max-w-md w-full ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
