import { IsEmail, IsMongoId, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsMongoId()
  restaurantId!: string;
}
