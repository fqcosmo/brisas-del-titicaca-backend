import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './auth/usuarios.module';
import { PrismaService } from './services/prisma.service';
import { UsuariosController } from './auth/usuarios.controller';
import { UsuariosService } from './auth/usuarios.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './JwtService';

@Module({
  imports: [UsuariosModule,
    JwtModule.register({
      secret: 'secretKey',  // Considera mover esto a una variable de entorno
      signOptions: { expiresIn: '72h' }
    }),
  ],
  controllers: [AppController,UsuariosController],
  providers: [AppService,PrismaService, UsuariosService,JwtAuthGuard],
})
export class AppModule {}
