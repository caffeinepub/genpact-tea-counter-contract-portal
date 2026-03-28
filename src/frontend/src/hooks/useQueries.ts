import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Bid, Stats, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return { totalBids: 0n, highestBid: 0n, averageBid: 0n };
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetMyProfile(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      const res = await actor.getMyProfile(userId);
      if (res.__kind__ === "ok") return res.ok;
      return null;
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetMyBid(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Bid | null>({
    queryKey: ["mybid", userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      const res = await actor.getMyBid(userId);
      if (res.__kind__ === "ok") return res.ok;
      return null;
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useAdminGetAllBidders(adminId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["admin-bidders", adminId],
    queryFn: async () => {
      if (!actor || !adminId) return [];
      const res = await actor.adminGetAllBidders(adminId);
      if (res.__kind__ === "ok") return res.ok;
      return [];
    },
    enabled: !!actor && !isFetching && !!adminId,
  });
}

export function useAdminGetAllBids(adminId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Bid[]>({
    queryKey: ["admin-bids", adminId],
    queryFn: async () => {
      if (!actor || !adminId) return [];
      const res = await actor.adminGetAllBids(adminId);
      if (res.__kind__ === "ok") return res.ok;
      return [];
    },
    enabled: !!actor && !isFetching && !!adminId,
  });
}

export function usePlaceBid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      amount,
    }: { userId: string; amount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      const res = await actor.placeBid(userId, amount);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["mybid", vars.userId] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useAcceptContract() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Not connected");
      const res = await actor.acceptContract(userId);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useAdminSelectWinner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      adminId,
      bidId,
    }: { adminId: string; bidId: string }) => {
      if (!actor) throw new Error("Not connected");
      const res = await actor.adminSelectWinner(adminId, bidId);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-bids", vars.adminId] });
    },
  });
}

export function useAdminLockBidding() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      adminId,
      lock,
    }: { adminId: string; lock: boolean }) => {
      if (!actor) throw new Error("Not connected");
      const res = await actor.adminLockBidding(adminId, lock);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
  });
}
