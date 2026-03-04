import { Type } from "class-transformer"
import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsString, IsStrongPassword, MaxLength } from "class-validator"

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  login: string

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  email: string

  @IsString()
  // @IsStrongPassword()
  @IsNotEmpty()
  @MaxLength(64)
  password: string

  @IsNumber()
  @IsInt()
  @Type(() => Number)
  age: number

  @IsString()
  @MaxLength(1000)
  description?: string
}
