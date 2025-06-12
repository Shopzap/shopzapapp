
// Utility functions for rendering email templates with dynamic data

export interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface EmailTemplateData {
  buyer_name: string;
  order_id: string;
  store_name: string;
  items: OrderItem[];
  total_amount: number;
  subtotal?: number;
  order_date?: string;
  buyer_email?: string;
  buyer_phone?: string;
  buyer_address?: string;
  invoice_link?: string;
  tracking_link?: string;
  return_or_reorder_link?: string;
}

export class EmailTemplateRenderer {
  /**
   * Simple template variable replacement function
   * Replaces {{variable}} with actual values
   */
  static renderTemplate(template: string, data: EmailTemplateData): string {
    let renderedTemplate = template;

    // Replace simple variables
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'items' && typeof value === 'string' || typeof value === 'number') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        renderedTemplate = renderedTemplate.replace(regex, String(value));
      }
    });

    // Handle items array with handlebars-like syntax
    const itemsRegex = /{{#each items}}([\s\S]*?){{\/each}}/g;
    renderedTemplate = renderedTemplate.replace(itemsRegex, (match, itemTemplate) => {
      return data.items.map(item => {
        let itemHtml = itemTemplate;
        Object.entries(item).forEach(([key, value]) => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          itemHtml = itemHtml.replace(regex, String(value));
        });
        return itemHtml;
      }).join('');
    });

    // Calculate subtotal if not provided
    if (!data.subtotal) {
      const subtotal = data.items.reduce((sum, item) => sum + item.total_price, 0);
      renderedTemplate = renderedTemplate.replace(/{{subtotal}}/g, String(subtotal));
    }

    // Set default values for missing links
    const defaultLinks = {
      invoice_link: '#',
      tracking_link: '#',
      return_or_reorder_link: '#'
    };

    Object.entries(defaultLinks).forEach(([key, defaultValue]) => {
      if (!data[key as keyof EmailTemplateData]) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        renderedTemplate = renderedTemplate.replace(regex, defaultValue);
      }
    });

    // Add current date if not provided
    if (!data.order_date) {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      renderedTemplate = renderedTemplate.replace(/{{order_date}}/g, currentDate);
    }

    return renderedTemplate;
  }

  /**
   * Load and render buyer confirmation email template
   */
  static async renderBuyerConfirmation(data: EmailTemplateData): Promise<string> {
    try {
      const response = await fetch('/src/templates/buyer-order-confirmation.html');
      const template = await response.text();
      return this.renderTemplate(template, data);
    } catch (error) {
      console.error('Error loading buyer confirmation template:', error);
      return this.getFallbackBuyerTemplate(data);
    }
  }

  /**
   * Load and render seller notification email template
   */
  static async renderSellerNotification(data: EmailTemplateData): Promise<string> {
    try {
      const response = await fetch('/src/templates/seller-order-notification.html');
      const template = await response.text();
      return this.renderTemplate(template, data);
    } catch (error) {
      console.error('Error loading seller notification template:', error);
      return this.getFallbackSellerTemplate(data);
    }
  }

  /**
   * Fallback buyer template if file loading fails
   */
  private static getFallbackBuyerTemplate(data: EmailTemplateData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #7b3fe4; color: white; padding: 20px; text-align: center;">
          <h1>ShopZap</h1>
          <p>Order Confirmation</p>
        </div>
        <div style="padding: 20px;">
          <h2>Hi ${data.buyer_name},</h2>
          <p>Thank you for your order!</p>
          <p><strong>Order ID:</strong> #${data.order_id}</p>
          <p><strong>Store:</strong> ${data.store_name}</p>
          <p><strong>Total:</strong> ₹${data.total_amount}</p>
        </div>
      </div>
    `;
  }

  /**
   * Fallback seller template if file loading fails
   */
  private static getFallbackSellerTemplate(data: EmailTemplateData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #7b3fe4; color: white; padding: 20px; text-align: center;">
          <h1>ShopZap</h1>
          <p>New Order Received</p>
        </div>
        <div style="padding: 20px;">
          <h2>Hi ${data.store_name} Team,</h2>
          <p>You have a new order!</p>
          <p><strong>Order ID:</strong> #${data.order_id}</p>
          <p><strong>Customer:</strong> ${data.buyer_name}</p>
          <p><strong>Total:</strong> ₹${data.total_amount}</p>
          <p>Please pack and fulfill this order promptly.</p>
        </div>
      </div>
    `;
  }
}
