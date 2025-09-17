import cron from 'node-cron';
import { AppDataSource } from '../data-source';
import { Bill } from '../entities/bill.entity';
import { sendWarrantyReminderEmail } from './email.service';
import logger from '../utils/logger';

interface WarrantyCheckResult {
  totalBills: number;
  eligibleForReminder: number;
  emailsSent: number;
  emailsFailed: number;
}

const isWarrantyExpiringSoon = (purchaseDate: string, warrantyPeriodMonths: number): { isExpiring: boolean; expiryDate: Date; daysUntilExpiry: number } => {
  const purchase = new Date(purchaseDate);
  const expiry = new Date(purchase);
  expiry.setMonth(expiry.getMonth() + warrantyPeriodMonths);
  
  const today = new Date();
  const timeDiff = expiry.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Send reminders 30, 7, and 1 day before expiry
  const isExpiring = daysUntilExpiry === 30 || daysUntilExpiry === 7 || daysUntilExpiry === 1;
  
  return {
    isExpiring,
    expiryDate: expiry,
    daysUntilExpiry
  };
};

export const checkWarrantyExpirations = async (): Promise<WarrantyCheckResult> => {
  const result: WarrantyCheckResult = {
    totalBills: 0,
    eligibleForReminder: 0,
    emailsSent: 0,
    emailsFailed: 0
  };

  try {
    const billRepository = AppDataSource.getRepository(Bill);
    const bills = await billRepository.find({ 
      relations: ['user']
    });
    
    // Filter out bills without required data
    const validBills = bills.filter(bill => 
      bill.purchaseDate && bill.warrantyPeriod && bill.productName
    );

    result.totalBills = bills.length;
    logger.info(`Checking warranty expiration for ${bills.length} bills`);

    const reminderPromises = bills.map(async (bill) => {
      if (!bill.purchaseDate || !bill.warrantyPeriod || !bill.productName) {
        return;
      }

      const warrantyCheck = isWarrantyExpiringSoon(bill.purchaseDate, bill.warrantyPeriod);
      
      if (warrantyCheck.isExpiring) {
        result.eligibleForReminder++;
        
        logger.info('Sending warranty reminder', {
          billId: bill.id,
          productName: bill.productName,
          userEmail: bill.user.email,
          daysUntilExpiry: warrantyCheck.daysUntilExpiry,
          expiryDate: warrantyCheck.expiryDate.toISOString()
        });

        const emailSent = await sendWarrantyReminderEmail(
          bill.user.email,
          bill.productName,
          warrantyCheck.expiryDate.toLocaleDateString()
        );

        if (emailSent) {
          result.emailsSent++;
        } else {
          result.emailsFailed++;
        }
      }
    });

    await Promise.all(reminderPromises);
    
    logger.info('Warranty check completed', result);
    return result;
  } catch (error) {
    logger.error('Error during warranty expiration check:', error);
    throw error;
  }
};

export const startWarrantyReminderCronJob = () => {
  // Run daily at 9:00 AM
  const cronExpression = '0 9 * * *';
  
  logger.info(`Starting warranty reminder cron job with expression: ${cronExpression}`);
  
  // Create and schedule the task
  const task = cron.schedule(
    cronExpression, 
    async () => {
      logger.info('Running warranty reminder cron job...');
      
      try {
        const result = await checkWarrantyExpirations();
        logger.info('Warranty reminder cron job completed successfully', result);
      } catch (error) {
        logger.error('Warranty reminder cron job failed:', error);
      }
    },
    {
      timezone: 'Asia/Kolkata'
    } as any // Type assertion to bypass the type checking for the options
  );
  
  // The task is automatically started when created
  logger.info('Warranty reminder cron job started successfully');
  
  // Return the task in case you need to stop it later
  return task;
  
  logger.info('Warranty reminder cron job started successfully');
};

// Manual trigger function for testing
export const triggerWarrantyCheck = async (): Promise<WarrantyCheckResult> => {
  logger.info('Manually triggering warranty check...');
  return await checkWarrantyExpirations();
};

