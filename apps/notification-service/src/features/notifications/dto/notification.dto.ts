import { ApiProperty } from '@nestjs/swagger';

export class notificationDto<T> {
  @ApiProperty({
    example: 'b9cdad71-13b0-41a5-aced-8b4836e6027c',
    description: 'id of the user',
  })
  userId: string;

  @ApiProperty({
    example: {
      message: 'hello',
    },
    description: 'data',
  })
  data: T;
}
