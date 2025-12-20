import { IsString, IsIn } from 'class-validator';

export class AssignUserDto {
  @IsString()
  user_id: string;

  @IsString()
  organization_id: string;

  @IsString()
  @IsIn(['owner', 'user'])
  role: 'owner' | 'user';
}
