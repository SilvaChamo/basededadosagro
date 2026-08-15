"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    const handleAuth = async () => {
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                
                if (error) {
                    if (error.message === "Invalid login credentials") {
                        setError("Credenciais inválidas. Verifique email e password.");
                    } else {
                        setError(error.message);
                    }
                    return;
                }
                
                // Login sucesso - redirecionar para admin
                router.push("/admin/blog");
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                
                if (error) {
                    setError(error.message);
                    return;
                }
                
                setError("Registro realizado! Verifique seu email para confirmar.");
            }
        } catch (error: any) {
            setError("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Logo/Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">
                        Base AgroData
                    </h1>
                    <p className="text-slate-600">
                        Painel Administrativo
                    </p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader>
                        <CardTitle className="text-center">
                            {isLogin ? "Bem-vindo de volta" : "Criar conta"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@exemplo.com"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <Button 
                            onClick={handleAuth} 
                            disabled={loading || !email || !password} 
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            size="lg"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Spinner className="w-4 h-4" />
                                    Processando...
                                </div>
                            ) : (
                                isLogin ? "Entrar no Painel" : "Criar Conta"
                            )}
                        </Button>
                        
                        <div className="text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                {isLogin ? "Não tem conta? Registre-se" : "Já tem conta? Faça login"}
                            </button>
                        </div>
                        
                        {/* Credenciais de teste */}
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <p className="text-xs font-black text-slate-700 mb-2">Credenciais de Teste:</p>
                            <div className="space-y-1 text-xs text-slate-600">
                                <p><span className="font-medium">Email:</span> admin@basededadosagro.com</p>
                                <p><span className="font-medium">Password:</span> admin123</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Nota: Use as credenciais acima ou crie sua própria conta
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-xs text-slate-500">
                        Ao fazer login, você concorda com os termos de uso e política de privacidade
                    </p>
                </div>
            </div>
        </div>
    );
}
