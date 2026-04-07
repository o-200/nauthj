import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsString, IsStrongPassword, MaxLength } from "class-validator"

export class CreateUserDto {
  @ApiProperty({
    example: 'alex123',
    description: 'Unique user login',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  login: string

  @ApiProperty({
    example: 'o200@email.sru',
    description: 'Unique user email',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  email: string

  @ApiProperty({
    example: 'strongPassword123',
    description: 'User password',
    minLength: 6,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  password: string

  @ApiProperty({
    example: '18',
    description: 'User age',
  })
  @IsNumber()
  @IsInt()
  @Type(() => Number)
  age: number

  @ApiProperty({
    example: 'my description yopta',
    description: 'User description',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  description?: string
}
