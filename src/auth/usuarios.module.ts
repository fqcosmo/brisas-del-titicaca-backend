import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from 'src/services/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/JwtService';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey',  // Considera mover esto a una variable de entorno
      signOptions: { expiresIn: '72h' }
    }),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService,PrismaService,JwtAuthGuard]
})
export class UsuariosModule {}
