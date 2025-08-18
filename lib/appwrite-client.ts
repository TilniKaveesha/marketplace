import { Client, Account, Storage, Databases } from "appwrite"
import { APP_CONFIG } from "./app-config"

export function createClientSideClient() {
  const client = new Client().setEndpoint(APP_CONFIG.APPWRITE.ENDPOINT).setProject(APP_CONFIG.APPWRITE.PROJECT_ID)

  return {
    get account() {
      return new Account(client)
    },
    get databases() {
      return new Databases(client)
    },
    get storage() {
      return new Storage(client)
    },
  }
}

export async function createAnonymousClient() {
  const client = new Client().setEndpoint(APP_CONFIG.APPWRITE.ENDPOINT).setProject(APP_CONFIG.APPWRITE.PROJECT_ID)

  return {
    get databases() {
      return new Databases(client)
    },
  }
}
