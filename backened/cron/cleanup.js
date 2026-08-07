import cron from 'node-cron';
import Car from '../models/car.models.js';

const cleanupExpiredCars = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day for consistent comparison

    console.log('Running scheduled job: Cleaning up expired car listings...');

    const result = await Car.updateMany(
      {
        availabilityEnd: { $lt: today },
        isDeleted: false,
      },
      {
        $set: { isDeleted: true },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Successfully marked ${result.modifiedCount} expired car(s) as deleted.`);
    } else {
      console.log('No expired car listings to clean up.');
    }
  } catch (error) {
    console.error('Error during scheduled car cleanup:', error);
  }
};

// Schedule the task to run once every day at midnight
const scheduledCleanup = () => {
    cron.schedule('0 0 * * *', cleanupExpiredCars, {
        scheduled: true,
        timezone: "UTC"
    });
    console.log('Scheduled car cleanup job to run daily at midnight (UTC).');
};

export default scheduledCleanup;
