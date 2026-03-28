import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Bid {
    id: string;
    submittedAt: bigint;
    isWinner: boolean;
    bidderId: string;
    amount: bigint;
}
export interface Stats {
    totalBids: bigint;
    highestBid: bigint;
    averageBid: bigint;
}
export interface UserProfile {
    id: string;
    dob: string;
    gst: string;
    pan: string;
    name: string;
    createdAt: bigint;
    role: string;
    aadhaar: string;
    email: string;
    experience: string;
    contractAccepted: boolean;
    companyName: string;
    passwordHash: string;
    phone: string;
    outlets: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptContract(userId: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetAllBidders(adminId: string): Promise<{
        __kind__: "ok";
        ok: Array<UserProfile>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetAllBids(adminId: string): Promise<{
        __kind__: "ok";
        ok: Array<Bid>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminLockBidding(adminId: string, lock: boolean): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSelectWinner(adminId: string, bidId: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getMyBid(userId: string): Promise<{
        __kind__: "ok";
        ok: Bid;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getMyProfile(userId: string): Promise<{
        __kind__: "ok";
        ok: UserProfile;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getStats(): Promise<Stats>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    login(email: string, passwordHash: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    placeBid(userId: string, amount: bigint): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    register(name: string, email: string, phone: string, passwordHash: string, pan: string, aadhaar: string, gst: string, companyName: string, dob: string, experience: string, outlets: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
