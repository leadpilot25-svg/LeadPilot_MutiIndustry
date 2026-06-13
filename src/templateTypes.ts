export interface FollowUpTemplate {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  content: string;
}

export interface GlobalTemplates {
  whatsapp: FollowUpTemplate[];
  email: FollowUpTemplate[];
  sms: FollowUpTemplate[];
}