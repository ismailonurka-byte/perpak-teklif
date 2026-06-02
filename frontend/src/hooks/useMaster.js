import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
export function useMaster() {
    return useQuery({
        queryKey: ["master-all"],
        queryFn: async () => (await api.get("/master/all")).data,
        staleTime: 60 * 60 * 1000, // 1 saat cache
    });
}
