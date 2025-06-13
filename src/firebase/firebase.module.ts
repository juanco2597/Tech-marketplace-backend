import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigModule, ConfigService } from '@nestjs/config'; 

@Module({
  imports: [ConfigModule], 
  providers: [
    {
      provide: 'FIRESTORE_DB',
      useFactory: (configService: ConfigService) => {
        const serviceAccountJsonString = configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

        if (!serviceAccountJsonString) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
        }

        let serviceAccount;
        try {
          serviceAccount = JSON.parse(serviceAccountJsonString);
        } catch (e) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not a valid JSON string.');
        }
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        return admin.app();
      },
      inject: [ConfigService], 
    },
  ],
  exports: ['FIRESTORE_DB'],
})
export class FirebaseModule {}