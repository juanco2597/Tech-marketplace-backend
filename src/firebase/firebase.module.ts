import { Module, Global } from '@nestjs/common'
import * as admin from 'firebase-admin'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config() 

@Global() 
@Module({
  providers: [
    {
      provide: 'FIREBASE_APP', 
      useFactory: () => {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH

        if (!serviceAccountPath) {
          console.error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_PATH no está configurada.')
          throw new Error('Firebase configuration error: Missing service account path.')
        }

        const absoluteServiceAccountPath = path.resolve(process.cwd(), serviceAccountPath)

        if (admin.apps.length === 0) {
          admin.initializeApp({
            credential: admin.credential.cert(require(absoluteServiceAccountPath)), 
          })
          console.log('Firebase Admin SDK initialized using service account file.')
        } else {
          console.log('Firebase Admin SDK already initialized.')
        }
        return admin.app() 
      },
    },
    {
      provide: 'FIRESTORE_DB', 
      useFactory: (app: admin.app.App) => app.firestore(),
      inject: ['FIREBASE_APP'], 
    },
  ],
  exports: ['FIREBASE_APP', 'FIRESTORE_DB'], 
})
export class FirebaseModule {}
