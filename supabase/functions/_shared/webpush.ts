import {
  buildPushPayload,
  type PushSubscription,
  type PushMessage,
  type VapidKeys,
} from "https://esm.sh/@block65/webcrypto-web-push@1.0.2";

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushResult {
  success: boolean;
  status?: number;
  statusText?: string;
  body?: string;
  endpoint: string;
}

export async function sendWebPush(
  subscription: PushSubscriptionData,
  payload: string,
  vapidPublicKeyB64: string,
  vapidPrivateKeyB64: string,
  vapidEmail: string,
): Promise<PushResult> {
  const vapid: VapidKeys = {
    subject: `mailto:${vapidEmail}`,
    publicKey: vapidPublicKeyB64,
    privateKey: vapidPrivateKeyB64,
  };

  const pushSub: PushSubscription = {
    endpoint: subscription.endpoint,
    expirationTime: null,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  const message: PushMessage = {
    data: payload,
    options: {
      ttl: 86400,
      urgency: "high",
    },
  };

  const request = await buildPushPayload(message, pushSub, vapid);

  const response = await fetch(request);
  const body = await response.text().catch(() => "");

  return {
    success: response.ok,
    status: response.status,
    statusText: response.statusText,
    body,
    endpoint: subscription.endpoint,
  };
}
