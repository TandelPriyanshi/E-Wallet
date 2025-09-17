import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Bill } from '../entities/bill.entity';
import { ApiResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    const billRepository = AppDataSource.getRepository(Bill);
    
    // Get all user bills
    const bills = await billRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' }
    });

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

    // Basic statistics
    const stats = {
      totalBills: bills.length,
      billsThisMonth: bills.filter(bill => new Date(bill.createdAt) >= thirtyDaysAgo).length,
      billsThisWeek: bills.filter(bill => new Date(bill.createdAt) >= sevenDaysAgo).length,
      totalSpent: 0,
      averageBillAmount: 0,
      categoryDistribution: {} as Record<string, number>,
      warrantyStatus: {
        active: 0,
        expired: 0,
        expiring_soon: 0, // within 30 days
        no_warranty: 0
      },
      monthlySpending: [] as Array<{ month: string; amount: number; count: number }>
    };

    // Calculate total spending and category distribution
    let totalAmount = 0;
    const categoryCount: Record<string, number> = {};
    const monthlyData: Record<string, { amount: number; count: number }> = {};

    for (const bill of bills) {
      // Total spending
      const amount = parseFloat(bill.metadata?.totalAmount || '0');
      if (!isNaN(amount)) {
        totalAmount += amount;
      }

      // Category distribution
      const category = bill.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;

      // Monthly spending
      if (bill.purchaseDate) {
        const monthKey = bill.purchaseDate.substring(0, 7); // YYYY-MM format
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { amount: 0, count: 0 };
        }
        monthlyData[monthKey].amount += amount;
        monthlyData[monthKey].count += 1;
      }

      // Warranty status
      if (bill.purchaseDate && bill.warrantyPeriod && bill.warrantyPeriod > 0) {
        const purchaseDate = new Date(bill.purchaseDate);
        const warrantyEndDate = new Date(purchaseDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + bill.warrantyPeriod);

        const timeDiff = warrantyEndDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff > 30) {
          stats.warrantyStatus.active++;
        } else if (daysDiff > 0) {
          stats.warrantyStatus.expiring_soon++;
        } else {
          stats.warrantyStatus.expired++;
        }
      } else {
        stats.warrantyStatus.no_warranty++;
      }
    }

    stats.totalSpent = totalAmount;
    stats.averageBillAmount = bills.length > 0 ? totalAmount / bills.length : 0;
    stats.categoryDistribution = categoryCount;

    // Format monthly data
    stats.monthlySpending = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count
      }));

    // Get recent bills (last 5)
    const recentBills = bills.slice(0, 5).map(bill => ({
      id: bill.id,
      filename: bill.filename,
      productName: bill.productName,
      category: bill.category,
      amount: bill.metadata?.totalAmount || '0',
      createdAt: bill.createdAt,
      purchaseDate: bill.purchaseDate
    }));

    // Get bills expiring soon (within 30 days)
    const expiringSoon = bills
      .filter(bill => {
        if (!bill.purchaseDate || !bill.warrantyPeriod) return false;
        
        const purchaseDate = new Date(bill.purchaseDate);
        const warrantyEndDate = new Date(purchaseDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + bill.warrantyPeriod);

        const timeDiff = warrantyEndDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return daysDiff > 0 && daysDiff <= 30;
      })
      .sort((a, b) => {
        const aDate = new Date(a.purchaseDate!);
        aDate.setMonth(aDate.getMonth() + a.warrantyPeriod!);
        const bDate = new Date(b.purchaseDate!);
        bDate.setMonth(bDate.getMonth() + b.warrantyPeriod!);
        return aDate.getTime() - bDate.getTime();
      })
      .slice(0, 10)
      .map(bill => {
        const purchaseDate = new Date(bill.purchaseDate!);
        const warrantyEndDate = new Date(purchaseDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + bill.warrantyPeriod!);
        
        const timeDiff = warrantyEndDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
          id: bill.id,
          productName: bill.productName,
          category: bill.category,
          purchaseDate: bill.purchaseDate,
          warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
          daysLeft
        };
      });

    const dashboardData = {
      stats,
      recentBills,
      expiringSoon
    };

    logger.info('Dashboard data retrieved successfully', { userId, stats });
    return ApiResponse.success(res, 'Dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    logger.error('Error retrieving dashboard data:', error);
    next(error);
  }
};

export const getCategoryStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    const billRepository = AppDataSource.getRepository(Bill);
    
    const rawQuery = `
      SELECT 
        COALESCE(category, 'Other') as category,
        COUNT(*) as count,
        COALESCE(SUM(CAST(metadata->>'totalAmount' AS DECIMAL)), 0) as total_amount,
        COALESCE(AVG(CAST(metadata->>'totalAmount' AS DECIMAL)), 0) as avg_amount
      FROM bill 
      WHERE user_id = $1 
        AND metadata->>'totalAmount' IS NOT NULL 
        AND metadata->>'totalAmount' != ''
      GROUP BY category
      ORDER BY total_amount DESC
    `;

    const results = await billRepository.query(rawQuery, [userId]);

    const categoryStats = results.map((result: any) => ({
      category: result.category,
      count: parseInt(result.count),
      totalAmount: parseFloat(result.total_amount) || 0,
      averageAmount: parseFloat(result.avg_amount) || 0
    }));

    logger.info('Category statistics retrieved successfully', { userId, categories: categoryStats.length });
    return ApiResponse.success(res, 'Category statistics retrieved successfully', { categoryStats });
  } catch (error) {
    logger.error('Error retrieving category statistics:', error);
    next(error);
  }
};

export const getWarrantyOverview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    const billRepository = AppDataSource.getRepository(Bill);
    
    const bills = await billRepository.find({
      where: { user: { id: userId } },
      order: { purchaseDate: 'DESC' }
    });

    const today = new Date();
    const warrantyOverview = {
      totalWithWarranty: 0,
      active: [] as Array<{
        id: number;
        productName: string;
        category: string;
        purchaseDate: string;
        warrantyPeriod: number;
        warrantyEndDate: string;
        daysRemaining: number;
      }>,
      expiring: [] as Array<{
        id: number;
        productName: string;
        category: string;
        purchaseDate: string;
        warrantyPeriod: number;
        warrantyEndDate: string;
        daysRemaining: number;
      }>,
      expired: [] as Array<{
        id: number;
        productName: string;
        category: string;
        purchaseDate: string;
        warrantyPeriod: number;
        warrantyEndDate: string;
        daysRemaining: number;
      }>
    };

    for (const bill of bills) {
      if (bill.purchaseDate && bill.warrantyPeriod && bill.warrantyPeriod > 0) {
        warrantyOverview.totalWithWarranty++;
        
        const purchaseDate = new Date(bill.purchaseDate);
        const warrantyEndDate = new Date(purchaseDate);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + bill.warrantyPeriod);

        const timeDiff = warrantyEndDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const billInfo = {
          id: bill.id,
          productName: bill.productName,
          category: bill.category,
          purchaseDate: bill.purchaseDate,
          warrantyPeriod: bill.warrantyPeriod,
          warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
          daysRemaining: daysDiff
        };

        if (daysDiff > 30) {
          warrantyOverview.active.push(billInfo);
        } else if (daysDiff > 0) {
          warrantyOverview.expiring.push(billInfo);
        } else {
          warrantyOverview.expired.push(billInfo);
        }
      }
    }

    // Sort each category
    warrantyOverview.active.sort((a, b) => a.daysRemaining - b.daysRemaining);
    warrantyOverview.expiring.sort((a, b) => a.daysRemaining - b.daysRemaining);
    warrantyOverview.expired.sort((a, b) => b.daysRemaining - a.daysRemaining);

    logger.info('Warranty overview retrieved successfully', { userId, total: warrantyOverview.totalWithWarranty });
    return ApiResponse.success(res, 'Warranty overview retrieved successfully', warrantyOverview);
  } catch (error) {
    logger.error('Error retrieving warranty overview:', error);
    next(error);
  }
};
