import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadFilePayloadDto {
  @ApiProperty({
    example: '/profiles/avatars',
  })
  @IsString()
  @IsNotEmpty()
  readonly folder: string;

  @ApiProperty({
    example: 'file-name',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
