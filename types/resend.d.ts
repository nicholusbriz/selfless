// Type definitions for Resend
declare module 'resend' {
  export interface EmailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
  }

  export interface EmailResponse {
    data?: any;
    error?: any;
  }

  export class Resend {
    constructor(apiKey: string);
    emails: {
      send(options: EmailOptions): Promise<EmailResponse>;
    };
  }
}
