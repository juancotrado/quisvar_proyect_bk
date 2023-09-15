import cron from 'node-cron';

class TimerCron {
  constructor() {
    this.crontimer();
  }
  crontimer() {
    const value = '43 13 * * *';
    const options: cron.ScheduleOptions = { timezone: 'America/Bogota' };
    const schedule = () => {
      console.log('running a task every minute patito');
    };
    cron.schedule(value, schedule, options);
  }
}

export default TimerCron;
