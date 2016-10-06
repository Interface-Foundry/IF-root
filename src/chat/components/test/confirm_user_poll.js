module.exports = {
  'text': 'Send poll for lunch cuisine to the team members at `*ADDRESS*`',
  'attachments': [{
    'fallback': 'You are unable to confirm poll',
    'callback_id': 'confirm.user.polling',
    'color': 'grey',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'Confirm',
        'text': 'Confirm',
        'type': 'button',
        'value': 'confirmPolling',
        'style': 'primary'
      },
      {
        'name': 'View Team Members',
        'text': 'View Team Members',
        'type': 'button',
        'value': 'viewPollingMembers'
      },
      {
        'name': 'Cancel',
        'text': 'Cancel',
        'type': 'button',
        'value': 'cancelPolling'
      }
    ]
  }]
}
