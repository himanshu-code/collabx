"use client"
import {useAuth} from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import {  useEffect } from "react";
export default function Protected({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }},[user,loading]);
        if(loading || !user)return null;
        return <>{children}</>;
}