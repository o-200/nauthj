import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from '../users.service';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchFilterDto } from '../dto/search-filter.dto';
import { Cron } from '@nestjs/schedule';
import { CACHE_KEYS } from '@common/constants/cache.constants';
import { DATABASE_DEFAULTS } from '@common/constants/db.constants';
import { CRON_EXPRESSIONS } from '@common/constants/queue.constants';
import { INJECTION_TOKENS } from '@common/constants/tokens.constants';

@Injectable()
export class ResetBalancesJob {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(INJECTION_TOKENS.DATA_SOURCE)
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CRON_EXPRESSIONS.EVERY_10_MINUTES)
  async execute() {
    const limit = 100;
    let totalUpdated = 0;
    let cursor: Date | undefined = undefined;

    while (true) {
      const paginationDto: PaginationDto = {
        createdAt: cursor,
        limit,
      };

      const searchFilterDto: SearchFilterDto = {};

      const result = await this.usersService.findAll(
        paginationDto,
        searchFilterDto,
      );

      if (result.data.length === 0) {
        break;
      }

      const userIds = result.data.map((user) => user.id);

      await Promise.all(
        userIds.map(async (userId) => {
          await this.cacheManager.del(this.usersService.userCacheKey(userId));
        }),
      );

      await this.dataSource
        .createQueryBuilder()
        .update(User)
        .set({ balanceCents: DATABASE_DEFAULTS.ZERO_BALANCE_CENTS })
        .where({ id: In(userIds) })
        .execute();

      totalUpdated += result.data.length;

      if (!result.nextCursor) {
        break;
      }

      cursor = result.nextCursor;
    }

    await this.cacheManager.del(CACHE_KEYS.USERS_ACTIVE);

    return {
      totalUpdated,
    };
  }
}
