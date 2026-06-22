"use client";

import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from "@tanstack/react-query";
import { useState } from "react";
import type { LayoutProps } from "@/types";

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  },
  mutations: {
    retry: 0,
  },
};

export function QueryProvider({ children }: LayoutProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
