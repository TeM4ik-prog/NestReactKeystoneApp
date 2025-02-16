import { Prisma } from '@prisma/client';

export class RolesClass {
  static readonly user: string = 'user';
  static readonly admin: string = 'admin';
  static readonly superAdmin: string = 'superAdmin';
  static readonly orderUser: string = 'orderUser';
  static readonly controller: string = 'controller';
}

export type UserId = string | number;

export interface IBasicUser {
  id: UserId;
  role: string;

  EmailUser?;
  TelegramUser?;
  VkUser?;
  GoogleUser?;
}



// export interface ITelegramAuth {
//     id: number;
//     first_name: string;
//     username: string;
//     photo_url: string;
//     auth_date: number;
//     hash: string;
// }
