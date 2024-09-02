import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: 'Donoso ',
        email: 'donoso@gmail.com',
        confirm: 1,
        password: bcrypt.hashSync('123456', 10)
    }
]

export default usuarios