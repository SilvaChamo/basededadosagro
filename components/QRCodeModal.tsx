"use client";

import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Copy, Check, QrCode, Share2, Building2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
    subtitle?: string;
    logoUrl?: string;
}

export function QRCodeModal({ isOpen, onClose, url, title, subtitle, logoUrl }: QRCodeModalProps) {
    const [copied, setCopied] = React.useState(false);

    const slugify = (text: string) =>
        (text || "")
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link do perfil copiado com sucesso!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPNG = () => {
        const canvas = document.getElementById('modal-qr-canvas') as HTMLCanvasElement;
        if (!canvas) {
            toast.error("Erro ao gerar ficheiro de imagem.");
            return;
        }
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-${slugify(title)}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success("QR Code descarregado em formato PNG!");
    };

    const handleDownloadSVG = () => {
        const svg = document.getElementById('modal-qr-svg');
        if (!svg) {
            toast.error("Erro ao gerar vector SVG.");
            return;
        }
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `qrcode-${slugify(title)}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success("QR Code descarregado em formato SVG!");
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error("Por favor, permita pop-ups para imprimir o cartão.");
            return;
        }
        const canvas = document.getElementById('modal-qr-canvas') as HTMLCanvasElement;
        const imgData = canvas ? canvas.toDataURL('image/png') : '';

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Cartão Digital QR Code - ${title}</title>
                <style>
                    body {
                        font-family: 'Times New Roman', serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f8fafc;
                    }
                    .card {
                        background: #ffffff;
                        border: 2px solid #054736;
                        border-radius: 16px;
                        padding: 32px;
                        text-align: center;
                        max-width: 380px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    }
                    .brand {
                        font-size: 11px;
                        font-weight: bold;
                        color: #D96B27;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                    }
                    .title {
                        font-size: 20px;
                        font-weight: bold;
                        color: #054736;
                        margin-bottom: 4px;
                    }
                    .subtitle {
                        font-size: 12px;
                        color: #64748b;
                        margin-bottom: 20px;
                    }
                    .qr-container {
                        background: #ffffff;
                        padding: 16px;
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                        display: inline-block;
                        margin-bottom: 16px;
                    }
                    .qr-container img {
                        width: 200px;
                        height: 200px;
                    }
                    .footer {
                        font-size: 10px;
                        color: #94a3b8;
                        margin-top: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="brand">BASE DE DADOS AGRO MOÇAMBIQUE</div>
                    <div class="title">${title}</div>
                    <div class="subtitle">${subtitle || 'Cartão Digital de Acesso Rápido'}</div>
                    <div class="qr-container">
                        <img src="${imgData}" alt="QR Code" />
                    </div>
                    <div style="font-size: 11px; font-weight: bold; color: #054736;">Aponte a câmara do telemóvel para aceder</div>
                    <div class="footer">${url}</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[440px] bg-white rounded-2xl border border-slate-100 shadow-2xl p-6">
                <DialogHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl mx-auto mb-3 flex items-center justify-center border border-emerald-100 text-emerald-600">
                        <QrCode className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">
                        Cartão Digital & QR Code
                    </DialogTitle>
                    <DialogDescription className="text-xs font-medium text-slate-500">
                        Digitalize com o seu smartphone para aceder directamente ao perfil.
                    </DialogDescription>
                </DialogHeader>

                {/* Printable Card Container */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center space-y-4 my-2">
                    <div className="flex items-center justify-center gap-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt={title} className="w-8 h-8 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                        ) : (
                            <Building2 className="w-6 h-6 text-emerald-600" />
                        )}
                        <h4 className="font-bold text-slate-800 text-base leading-tight truncate max-w-[240px]">
                            {title}
                        </h4>
                    </div>
                    {subtitle && (
                        <p className="text-[11px] text-slate-500 font-medium leading-none capitalize">
                            {subtitle}
                        </p>
                    )}

                    {/* QR Code Canvas (Hidden for export) & SVG (Visible) */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-md inline-block">
                        <QRCodeSVG
                            id="modal-qr-svg"
                            value={url}
                            size={180}
                            level="H"
                            includeMargin={true}
                        />
                        <div className="hidden">
                            <QRCodeCanvas
                                id="modal-qr-canvas"
                                value={url}
                                size={400}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Perfil Oficial Verificado BDAgro</span>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                        onClick={handleDownloadPNG}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span>Descarregar PNG</span>
                    </Button>
                    <Button
                        onClick={handleDownloadSVG}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>Vector SVG</span>
                    </Button>
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4 text-orange-500" />
                        <span>Imprimir Cartão</span>
                    </Button>
                    <Button
                        onClick={handleCopyUrl}
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
