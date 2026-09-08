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
        html: `<p>Here's your copy of the <strong>${config.label}</strong>:</p>
               <p><a href="${pdfUrl}">Download the PDF</a></p>
               <p>Wayne Conrad Advisory</p>`
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
