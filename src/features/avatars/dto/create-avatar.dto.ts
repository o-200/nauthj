import { ApiProperty } from '@nestjs/swagger';
import { UploadFilePayloadDto } from 'src/providers/files/s3/dto/upload-file-payload.dto';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateAvatarDto extends UploadFilePayloadDto {
  @ApiProperty({
    example: '512cf215-61b6-4725-a796-51bf087522a50',
    description: 'User unique identifier',
  })
  @PrimaryGeneratedColumn('uuid')
  user_id: string;
}
