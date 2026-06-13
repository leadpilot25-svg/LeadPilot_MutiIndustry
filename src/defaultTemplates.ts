import { GlobalTemplates } from './templateTypes';

export const DEFAULT_TEMPLATES: GlobalTemplates = {
  whatsapp: [
    {
      id: 'wa1',
      name: 'New Lead',
      type: 'whatsapp',
      content: 'Hi {{name}}, thanks for your inquiry.'
    }
  ],
  email: [
    {
      id: 'em1',
      name: 'Introduction',
      type: 'email',
      subject: 'Thank you for contacting us',
      content: 'Hello {{name}}, thank you for your interest.'
    }
  ],
  sms: [
    {
      id: 'sms1',
      name: 'Quick Follow-up',
      type: 'sms',
      content: 'Hi {{name}}, just following up on your inquiry.'
    }
  ]
};