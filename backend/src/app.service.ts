import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly db: DatabaseService) {}

  
  async getTestDb() {
    return await this.db.post.findMany()
  }
}
