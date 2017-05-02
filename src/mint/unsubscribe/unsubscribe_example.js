var mailOptions = {
to: '<hannah.katznelson@kipthis.com>',
from: 'Kip Test <hello@kipthis.com>',
subject: 'The Love Below',
html: '<html><body><p>This is a test</p><a href="http://localhost:5000/landing?url=<%asm_preferences_raw_url%>">Which emails do you wanna get?</a></body></html>',
headers: {
  'x-smtpapi': '{"asm_group_id":2321,"asm_groups_to_display":[2273,2275]}'
  }
};

try {
mailer_transport.sendMail(mailOptions);
console.log('email sent');
} catch (e) {
logging.error('error sending test email', e);
}
