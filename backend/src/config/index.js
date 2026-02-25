import AppConfig from "./app.config.js";
import FirebaseConfig from "./firebase.config.js";
import AWSConfig from "./aws.config.js";
import WhatsAppConfig from "./whatsapp.config.js";

export const appConfig = new AppConfig();
export const firebaseConfig = new FirebaseConfig();
export const awsConfig = new AWSConfig();
export const whatsappConfig = new WhatsAppConfig();
