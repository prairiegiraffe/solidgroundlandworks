export async function onRequestPost(context) {
  try {
    const { request } = context;
    const formData = await request.formData();

    // Extract form fields
    const firstName = formData.get('first-name');
    const lastName = formData.get('last-name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Create email content
    const emailContent = `
New Contact Form Submission from Solid Ground Landworks Website

Name: ${firstName} ${lastName}
Email: ${email}

Message:
${message}

---
Submitted from: ${request.headers.get('origin') || 'solidgroundlandworks.com'}
Time: ${new Date().toLocaleString()}
    `;

    // Send email using Cloudflare's email service
    const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'spiro@solidgroundlandworks.com', name: 'Spiro' }],
            reply_to: { email: email, name: `${firstName} ${lastName}` },
          },
        ],
        from: {
          email: 'noreply@solidgroundlandworks.com',
          name: 'Solid Ground Landworks Website',
        },
        subject: `New Contact Form Submission from ${firstName} ${lastName}`,
        content: [
          {
            type: 'text/plain',
            value: emailContent,
          },
        ],
      }),
    });

    if (emailResponse.ok) {
      // Return success page or redirect
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Thank You - Solid Ground Landworks</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .success { color: #28a745; font-size: 24px; margin-bottom: 20px; }
            .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="success">✅ Thank You!</div>
          <h1>Your message has been sent successfully.</h1>
          <p>Thank you for contacting Solid Ground Landworks. We'll get back to you soon!</p>
          <a href="/" class="button">Return to Homepage</a>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    } else {
      throw new Error('Failed to send email');
    }

  } catch (error) {
    console.error('Form submission error:', error);

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Solid Ground Landworks</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { color: #dc3545; font-size: 24px; margin-bottom: 20px; }
          .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="error">❌ Error</div>
        <h1>Sorry, there was an error sending your message.</h1>
        <p>Please try again or contact us directly at spiro@solidgroundlandworks.com</p>
        <a href="/" class="button">Return to Homepage</a>
      </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}