"use client";

import { AuthForm } from "./AuthForm";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    params: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function LoginPage(props: PageProps) {
    return <AuthForm searchParams={props.searchParams} />;
}
