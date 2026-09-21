import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import fs from "node:fs"
import { prisma } from "./prisma"

type FirebaseCredentials = {
  project_id?: string
  client_email?: string
  private_key?: string
}

function firebaseCredentials(): FirebaseCredentials | null {
  const inline = String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim()
  const encoded = String(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "").trim()
  const serviceAccountFile = String(
    process.env.FIREBASE_SERVICE_ACCOUNT_FILE || "/app/secrets/gufo-delivery-firebase.json"
  ).trim()
  const fileContents = !inline && !encoded && serviceAccountFile && fs.existsSync(serviceAccountFile)
    ? fs.readFileSync(serviceAccountFile, "utf8")
    : ""
  const raw = inline || (encoded ? Buffer.from(encoded, "base64").toString("utf8") : fileContents)
  if (!raw) return null
  try {
    const credentials = JSON.parse(raw) as FirebaseCredentials
    return credentials.client_email && credentials.private_key ? credentials : null
  } catch {
    console.warn("[delivery-push] Firebase credentials are not valid JSON.")
    return null
  }
}

function messaging() {
  const credentials = firebaseCredentials()
  if (!credentials) return null
  try {
    if (!getApps().length) initializeApp({ credential: cert(credentials as ServiceAccount) })
    return getMessaging()
  } catch (error) {
    console.warn("[delivery-push] Firebase could not be initialized.", error)
    return null
  }
}

export async function sendDeliveryAnnouncementPush(input: { title: string; body: string; announcementId: string }) {
  const client = messaging()
  if (!client) return { configured: false, sent: 0 }

  const devices = await prisma.deliveryPushToken.findMany({ select: { id: true, token: true } })
  let sent = 0
  const invalidTokenIds: string[] = []

  for (let offset = 0; offset < devices.length; offset += 500) {
    const batch = devices.slice(offset, offset + 500)
    const response = await client.sendEachForMulticast({
      tokens: batch.map((device) => device.token),
      notification: { title: input.title, body: input.body },
      data: { type: "delivery_announcement", announcementId: input.announcementId },
      android: {
        priority: "high",
        // Retain an announcement while the phone is offline; FCM delivers it on reconnection.
        ttl: 7 * 24 * 60 * 60 * 1000,
        notification: { channelId: "gufo_delivery_news", sound: "default" },
      },
    })
    sent += response.successCount
    response.responses.forEach((item, index) => {
      const code = item.error?.code || ""
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
        invalidTokenIds.push(batch[index].id)
      }
    })
  }

  if (invalidTokenIds.length) {
    await prisma.deliveryPushToken.deleteMany({ where: { id: { in: invalidTokenIds } } })
  }
  return { configured: true, sent }
}
