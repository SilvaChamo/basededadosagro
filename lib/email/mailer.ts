import nodemailer from "nodemailer";

// Configuração de e-mail partilhada. O envio passa pelo relay do Brevo
// (smtp-relay.brevo.com:587): SMTP_USER é o login do Brevo (algo como
// xxxx@smtp-brevo.com), que NÃO serve de endereço "De". O "De" visível
// tem de ser um endereço do nosso domínio (autenticado no Brevo por
// DKIM) — vem de MAIL_FROM.

export function mailFromAddress(): string {
    return (
        process.env.MAIL_FROM ||
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "admin@basededadosagro.com"
    );
}

export function mailFromHeader(): string {
    const name = process.env.SMTP_USER_FROM_NAME || "Base de Dados Agro";
    return `"${name}" <${mailFromAddress()}>`;
}

export function createMailTransport() {
    const port = Number(process.env.SMTP_PORT) || 587;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465, // 587 usa STARTTLS
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
}
