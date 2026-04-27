import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ResetBalancesJob } from './jobs/reset-balances.job';
import { QUEUE_JOBS, QUEUE_NAMES } from '@common/constants/queue.constants';

@Processor(QUEUE_NAMES.USERS)
export class UsersProcessor extends WorkerHost {
  constructor(private readonly resetBalancesJob: ResetBalancesJob) {
    super();
  }

  async process(job: Job): Promise<unknown> {
    switch (job.name) {
      case QUEUE_JOBS.RESET_BALANCES:
        await this.resetBalancesJob.execute();
        return;

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  }
}
