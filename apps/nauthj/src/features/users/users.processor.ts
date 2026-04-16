import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ResetBalancesJob } from './jobs/reset-balances.job';

@Processor('users')
export class UsersProcessor extends WorkerHost {
  constructor(private readonly resetBalancesJob: ResetBalancesJob) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case 'resetBalances':
        await this.resetBalancesJob.execute();
        return;

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  }
}
