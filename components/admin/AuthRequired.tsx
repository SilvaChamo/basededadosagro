"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock, Mail } from "lucide-react";

interface AuthRequiredProps {
    children: React.ReactNode;
}

export function AuthRequired({ children }: AuthRequiredProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: any, session: any) => {
                setUser(session?.user || null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
    };

    const handleAuth = async () => {
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                setUser(data.user);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;
                setError("Verifique seu email para confirmar o registro!");
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-pulse" />
                    <p>Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    if (user) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="bg-white border-b p-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-emerald-600" />
                            <span className="font-medium">{user.email}</span>
                        </div>
                        <Button onClick={handleLogout} variant="outline" size="sm">
                            Sair
                        </Button>
                    </div>
                </div>
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-center">
                        <Lock className="w-5 h-5" />
                        {isLogin ? "Login Administrativo" : "Registro Administrativo"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@exemplo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <Button onClick={handleAuth} disabled={loading} className="w-full">
                        {loading ? "Processando..." : (isLogin ? "Entrar" : "Registrar")}
                    </Button>

                    <div className="text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-emerald-600 hover:underline"
                        >
                            {isLogin ? "Não tem conta? Registre-se" : "Já tem conta? Faça login"}
                        </button>
                    </div>

                    <div className="text-xs text-slate-500 border-t pt-4">
                        <p className="font-medium mb-2">Credenciais de teste:</p>
                        <p>Email: admin@basededadosagro.com</p>
                        <p>Password: admin123</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
