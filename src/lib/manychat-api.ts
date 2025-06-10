
const MANYCHAT_API_BASE = 'https://api.manychat.com';

export class ManyChatAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getPages() {
    const response = await fetch(`${MANYCHAT_API_BASE}/fb/page/getPages`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`ManyChat API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getPageInfo(pageId: string) {
    const response = await fetch(`${MANYCHAT_API_BASE}/fb/page/getPageInfo?page_id=${pageId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`ManyChat API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async exchangeCodeForToken(code: string, redirectUri: string) {
    const response = await fetch(`${MANYCHAT_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.REACT_APP_MANYCHAT_CLIENT_ID || '',
        client_secret: process.env.REACT_APP_MANYCHAT_CLIENT_SECRET || '',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }
}
