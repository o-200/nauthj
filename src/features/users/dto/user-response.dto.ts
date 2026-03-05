import { User } from "src/features/users/entities/user.entity";

export class UserResponseDto {
  constructor(user: User) {
    this.login = user.login;
    this.email = user.email;
    this.age = user.age;
    this.description = user.description;
  }

  login: string
  email: string
  age: number
  description?: string
}
