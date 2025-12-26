import { config } from '../config/env';

interface WebhookPayload {
    conversationId: string;
    senderId: string;
    senderUsername: string;
    text: string;
    timestamp: Date;
}

export const webhookService = {
    async triggerMessageWebhook(payload: WebhookPayload) {
        // Skip webhook if not configured or using default localhost URL
        if (!config.webhookUrl || config.webhookUrl.includes('localhost')) {
            return; // Silently skip - no webhook configured
        }

        try {
            const response = await fetch(config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error('Webhook failed:', response.statusText);
            } else {
                console.log('✅ Webhook triggered successfully');
            }
        } catch (error) {
            console.error('❌ Webhook error:', error);
            // Don't throw - webhook failures shouldn't break message sending
        }
    }
};
