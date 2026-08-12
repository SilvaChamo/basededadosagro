"use client";

import { AuthForm } from "../auth/login/AuthForm";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
    params: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function RegisterPage(props: PageProps) {
    return <AuthForm searchParams={props.searchParams} initialMode="register" />;
}
