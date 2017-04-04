The x-smtpapi header identifies the email as belonging to a specific unsubscription group.

You can create the group/s or find their ids on the IF sendgrid account, and there's also an API.

asm_groups_to_display specifies the unsubscribe groups the user will be shown / allowed to modify their subscription to --
  so for example we can avoid showing real users our "test" group

When sendgrid sends your email, it replaces <%asm_preferences_raw_url%>
  with a link to their unsubscribe options page. There's also a
  similar tag for a link that immediately unsubscribes the user from
  whichever unsubscribe group the email happens to be in.

We're hosting a page in server.js that embeds that url in an iframe,
  and will eventually surround it with kip branding
