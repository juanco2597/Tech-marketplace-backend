import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UsersController } from './users.controller';

@Module({
  imports: [FirebaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
