import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

export function getMailer(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;

  if (!host || !user || !pass) {
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
    return transporter;
  } catch (err) {
    console.warn('[Mailer] Could not initialize nodemailer transport:', err);
    return null;
  }
}

export async function sendCandidateInvitationEmail(
  toEmail: string,
  candidateName: string,
  jobTitle: string,
  companyName: string,
  invitationUrl: string
): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@hirenexa.ai';

  try {
    await mailer.sendMail({
      from: `"HireNexa AI" <${from}>`,
      to: toEmail,
      subject: `Interview Invitation: ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0c1222; color: #f1f5f9; border-radius: 16px;">
          <h2 style="color: #60a5fa; margin-top: 0;">You're Invited to Interview</h2>
          <p>Hello <strong>${candidateName}</strong>,</p>
          <p>You have been invited by <strong>${companyName}</strong> to complete an AI-powered interview for the position of <strong>${jobTitle}</strong>.</p>
          <div style="margin: 28px 0;">
            <a href="${invitationUrl}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
              Start Your Interview
            </a>
          </div>
          <p style="font-size: 13px; color: #94a3b8;">
            Direct link: <a href="${invitationUrl}" style="color: #38bdf8;">${invitationUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">
            HireNexa AI • Automated Intelligent Interview Platform
          </p>
        </div>
      `,
    });
    console.log(`[Mailer] Invitation email sent to ${toEmail}`);
    return true;
  } catch (error: any) {
    console.log(`[Mailer] Could not send email (${error?.message || 'SMTP error'})`);
    return false;
  }
}

export async function sendInterviewCompletedEmail(
  recruiterEmail: string,
  candidateName: string,
  jobTitle: string,
  overallScore: number,
  recommendation: string
): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@hirenexa.ai';

  try {
    await mailer.sendMail({
      from: `"HireNexa AI Notifications" <${from}>`,
      to: recruiterEmail,
      subject: `Interview Completed: ${candidateName} for ${jobTitle} (${overallScore}%)`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0c1222; color: #f1f5f9; border-radius: 16px;">
          <h2 style="color: #38bdf8; margin-top: 0;">Candidate Interview Dossier Ready</h2>
          <p>Candidate <strong>${candidateName}</strong> has completed their interview session for <strong>${jobTitle}</strong>.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 10px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Overall Score:</strong> ${overallScore}/100</p>
            <p style="margin: 4px 0;"><strong>AI Recommendation:</strong> ${recommendation}</p>
          </div>
          <p>Log in to your HireNexa Recruiter Hub to review the full transcript, skill breakdown, and record your decision.</p>
        </div>
      `,
    });
    return true;
  } catch (e) {
    return false;
  }
}
