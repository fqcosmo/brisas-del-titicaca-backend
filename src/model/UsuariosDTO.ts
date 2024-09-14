export interface Usuarios {
    id: number,
    username: string,
    password: string,
    email: string,
    create_time: Date,
    dni: string,
}

export interface UsuariosWithRole extends Usuarios {
    listUserRoles: any
}

export interface LoginAccess {
    email: string,
    password: string
}

export interface ResponsLogin {
    token: string,
    message: string,
    status: number,
    data: {
        username: string,
        email: string,
        create_time: Date,
        dni: string,
        rol: any

    },
}

export interface ResponseCreateUser {
    message: string,
    status: number
}


export interface ResponseUpdateUser {
    message: string,
    status: number
}