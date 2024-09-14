import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { LoginAccess, ResponseCreateUser, ResponseUpdateUser, ResponsLogin, Usuarios, UsuariosWithRole } from 'src/model/UsuariosDTO';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class UsuariosService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async getSearchUser(id: number) {
        try {
            const result = await this.prisma.user.findFirst({
                where: {
                    id: Number(id)
                },
                include: {
                    usuarios_roles: {
                        include: {
                            rol: {
                                include: {
                                    permisos_roles: {
                                        include: {
                                            permiso: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            delete result.password
            return result;
        } catch (error) {
            throw new Error(error);
        }
    }

    async getRoles() {
        try {
            return this.prisma.roles.findMany();
        } catch (error) {
            throw new Error(error);
        }
    }

    async getUser(page: number = 1) {
        const pageSize = 10; // Número de usuarios por página
    
        if (page < 1) {
            throw new Error("Page number must be greater than or equal to 1");
        }

        try {
            const users = await this.prisma.user.findMany({
                take: pageSize, // Límite de usuarios por página
                skip: (page - 1) * pageSize, // Saltar los usuarios de las páginas anteriores
                select: {
                    id: true,
                    username: true,
                    email: true,
                    create_time: true,
                    dni: true,
                    usuarios_roles: {
                        include: {
                            rol: {
                                include: {
                                    permisos_roles: {
                                        include: {
                                            permiso: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            });
    
            // Contar el total de usuarios
            const totalUsers = await this.prisma.user.count();
            const totalPages = Math.ceil(totalUsers / pageSize); // Calcular total de páginas
    
            return {
                users,
                totalPages,
                currentPage: page,
                pageSize,
            };
        } catch (error) {
            // Proporcionar más contexto sobre el error
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }
    

    async createUser(user: Usuarios) {
        try {

            const passwordHashed = (await bcrypt.hash(user.password, 10)).toString();

            const result = await this.prisma.user.create({
                data: {
                    username: user.username,
                    password: passwordHashed,
                    create_time: user.create_time,
                    dni: user.dni,
                    email: user.email,
                }
            });

            if (!result) {
                throw new HttpException('Error al crear el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const response: ResponseCreateUser = {
                message: 'Usuario creado con éxito',
                status: 201,
            };

            return response;
        } catch (error) {
            throw new HttpException(
                error.message || 'Error en el servidor al crear el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



    async updateUser(user: UsuariosWithRole) {

        const listRoles = user.listUserRoles;
        console.log(listRoles)

        delete user.listUserRoles

        try {
            if (!user.id) {
                throw new HttpException('ID del usuario es requerido', HttpStatus.BAD_REQUEST);
            }

            const result = await this.prisma.user.update({
                where: {
                    id: Number(user.id)
                },
                data: user,
                include: {
                    usuarios_roles: true
                }
            });

            await this.prisma.usuarios_roles.deleteMany({
                where: {
                    idUsuario: user.id
                }
            })

            listRoles.forEach(async (id) => {
                const d = await this.prisma.usuarios_roles.create({
                    data: {
                        idRol: id,
                        idUsuario: Number(user.id)
                    }
                })
            });

            console.log(result)

            if (!result) {
                throw new HttpException('No se pudo actualizar el usuario', HttpStatus.NOT_FOUND);
            }

            const response: ResponseUpdateUser = {
                message: 'Usuario actualizado correctamente',
                status: 200
            };

            return response;
        } catch (error) {
            console.log(error)
            throw new HttpException(
                error.message || 'Error en el servidor al actualizar el usuario',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }


    async loginUsers(accessLogin: LoginAccess) {
        try {
            const result = await this.prisma.user.findFirst({
                where: {
                    email: accessLogin.email,
                },
                include: {
                    usuarios_roles: {
                        include: {
                            rol: {
                                include: {
                                    permisos_roles: {
                                        include: {
                                            permiso: true
                                        }
                                    },
                                }
                            }
                        }
                    }
                }
            })

            if (!result) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            const isPasswordValid = bcrypt.compareSync(accessLogin.password, result.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Contraseña incorrecta');
            }
            delete result.password;
            const token = this.jwtService.sign({
                data: result
            });

            const response: ResponsLogin = {
                token,
                message: 'Login successful',
                status: 200,
                data: {
                    username: result.username,
                    email: result.email,
                    create_time: result.create_time,
                    dni: result.dni,
                    rol: result.usuarios_roles
                },
            };

            return response;
        } catch (error) {
            throw new UnauthorizedException(error);
        }
    }

    async deleteUser(id: number) {
        try {
            const result = this.prisma.user.findMany({
                where: {
                    id: Number(id)
                }
            })

            if (!result) {
                throw new Error('NO SE ENCONTRO EL ID');
            }

            return this.prisma.user.delete({
                where: {
                    id: Number(id)
                }
            })
        } catch (error: any) {
            throw new Error(error);
        }
    }

    async getSession(token: string) {
        try {
            const session = this.jwtService.verify(token);
            return session;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
