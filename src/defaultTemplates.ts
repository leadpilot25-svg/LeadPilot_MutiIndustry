import { GlobalTemplates } from './templateTypes';

export const DEFAULT_TEMPLATES: GlobalTemplates = {
  whatsapp: [
    {
      id: 'wa1',
      name: 'New Lead',
      type: 'whatsapp',
      content: 'Hi {{name}}, thank you for your inquiry. When would be a good time to connect?'
    },
    {
      id: 'wa2',
      name: 'Follow-Up #1',
      type: 'whatsapp',
      content: 'Hi {{name}}, just following up regarding your inquiry. Let me know if you have any questions.'
    }
  ],

  email: [
    {
      id: 'em1',
      name: 'Introduction',
      type: 'email',
      subject: 'Thank you for contacting us',
      content: 'Hello {{name}},\n\nThank you for your interest. Please let us know how we can help.\n\nRegards'
    }
  ],

  sms: [
    {
      id: 'sms1',
      name: 'Quick Reminder',
      type: 'sms',
      content: 'Hi {{name}}, just checking in regarding your inquiry.'
    }
  ]
};