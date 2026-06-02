import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { MasterData } from "@/types";

export function useMaster() {
  return useQuery<MasterData>({
    queryKey: ["master-all"],
    queryFn: async () => (await api.get("/master/all")).data,
    staleTime: 60 * 60 * 1000, // 1 saat cache
  });
}
