import { Body, Controller, Post,Get,Put, Headers, Delete, UseGuards, Param } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { LoginAccess,Usuarios, UsuariosWithRole } from 'src/model/UsuariosDTO';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/JwtService';
import { Query } from '@nestjs/common';

@Controller('auth')
export class UsuariosController {
    
    constructor(
        private  usuarioService:UsuariosService
    ){}

    @UseGuards(JwtAuthGuard)
    @Get('/searchuser/:id')
    async getSearchUser(@Param('id') id:number){
        return this.usuarioService.getSearchUser(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/listuser')
    async getUser() {
        // const pageNumber = page ? parseInt(page, 10) : 1;
        return this.usuarioService.getUser();
    }

    @UseGuards(JwtAuthGuard)
    @Get('/listuserPage')
    async getUserPagination(@Query('page') page: string) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        return this.usuarioService.getUser(pageNumber);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/listroles')
    async getRoles() {
        return this.usuarioService.getRoles();
    } 

    @Post('/login')
    async loginUsers(@Body() accessLogin:LoginAccess){
        return this.usuarioService.loginUsers(accessLogin)
    }

    @Get('/session')
    async getSession(@Headers('authorization') authHeader: string): Promise<any> {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authorization header missing or malformed');
        }
        const token = authHeader.split(' ')[1]; // Extraer el token del encabezado
        return this.usuarioService.getSession(token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/create')
    async createUser(@Body() user: Usuarios) {
        return this.usuarioService.createUser(user)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/update')
    async updateUser(@Body() user: UsuariosWithRole) {
        return this.usuarioService.updateUser(user)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/delete/:idUser')
    async deleteUser(@Param(':idUser') idUser:number) {
        return this.deleteUser(idUser);
    }
}
