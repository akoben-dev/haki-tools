// components/Container.tsx
import { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-content px-4 md:px-6 lg:px-8">
      {children}
    </div>
  );
}
