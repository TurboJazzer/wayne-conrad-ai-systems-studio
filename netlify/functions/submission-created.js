// Netlify Function triggered by Netlify Forms' "submission-created" event.
// Sends the matching lead-magnet PDF link via Resend.
// Requires env var RESEND_API_KEY (Site settings > Environment variables).

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Wayne Conrad Advisory <wayne@wayneconrad.com>";
const SITE_URL = "https://wayne-conrad-ai-systems-studio.netlify.app";

const PDF_BY_FORM = {
  "lead-magnet": {
    subject: "Your Manual Coordination & Friction Cost Audit",
    file: "friction-cost-audit.pdf",
    label: "Manual Coordination & Friction Cost Audit"
  },
  "lead-magnet-matrix": {
    subject: "Your Decision Rights & Bottleneck Matrix",
    file: "decision-rights-matrix.pdf",
    label: "Decision Rights & Bottleneck Matrix"
  }
};

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body).payload;
    const formName = payload.form_name;
    const email = payload.data && payload.data.email;
    const rawName = payload.data && payload.data["first-name"];
    const firstName = (rawName && rawName.trim()) || (email ? email.split("@")[0] : "there");
    const config = PDF_BY_FORM[formName];

    if (!config || !email) {
      return { statusCode: 200, body: "Ignored (not a lead-magnet form or no email)." };
    }

    const pdfUrl = `${SITE_URL}/downloads/${config.file}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: config.subject,
        html: `<!DOCTYPE html>
<html><head><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:#f6f8fd;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f6f8fd" style="background:#f6f8fd;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td bgcolor="#0d1b4b" style="background-color:#0d1b4b;padding:22px 32px">
<img src="${SITE_URL}/wayne-logo-email.png" alt="Wayne Conrad Advisory" height="26" style="display:block;height:26px;border:0">
</td></tr>
<tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding:32px">
<h1 style="margin:0 0 16px;font-size:20px;color:#0d1b4b">${config.label}</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4a5578">Hi ${firstName}, thanks for requesting this. Your copy is ready below.</p>
<a href="${pdfUrl}" style="display:inline-block;background-color:#2d5be3;color:#ffffff !important;text-decoration:none;font-weight:600;font-size:15px;padding:13px 24px;border-radius:8px">Download the PDF</a>
<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#4a5578">Have a bottleneck you'd like scoped for free? <a href="${SITE_URL}/#intake" style="color:#2d5be3;text-decoration:underline">Book a 15-minute audit</a>.</p>
</td></tr>
<tr><td bgcolor="#0d1b4b" style="background-color:#0d1b4b;padding:20px 32px;text-align:center">
<p style="margin:0;font-size:12px;color:#c7d2f0">Wayne Conrad Advisory (Pty) Ltd &middot; Sea Point, Cape Town, South Africa</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: 502, body: `Resend error: ${errText}` };
    }

    return { statusCode: 200, body: "Sent." };
  } catch (err) {
    return { statusCode: 500, body: `Function error: ${err.message}` };
  }
};
