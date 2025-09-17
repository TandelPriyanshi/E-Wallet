import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { SharedBill } from '../entities/shared-bill.entity';
import { Bill } from '../entities/bill.entity';
import { User } from '../entities/user.entity';
import { ApiResponse } from '../utils/response';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const shareBill = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { billId } = req.params;
    const { sharedWithEmail, permissionLevel = 'view' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    if (!billId || isNaN(parseInt(billId))) {
      return ApiResponse.badRequest(res, 'Invalid bill ID');
    }

    const billRepository = AppDataSource.getRepository(Bill);
    const userRepository = AppDataSource.getRepository(User);
    const sharedBillRepository = AppDataSource.getRepository(SharedBill);

    // Check if bill exists and belongs to the current user
    const bill = await billRepository.findOne({
      where: { 
        id: parseInt(billId), 
        user: { id: userId } 
      },
      relations: ['user']
    });

    if (!bill) {
      return ApiResponse.notFound(res, 'Bill not found or you do not have permission to share it');
    }

    // Find user to share with
    const sharedWithUser = await userRepository.findOne({
      where: { email: sharedWithEmail }
    });

    if (!sharedWithUser) {
      return ApiResponse.notFound(res, 'User with this email address not found');
    }

    // Prevent sharing with oneself
    if (sharedWithUser.id === userId) {
      return ApiResponse.badRequest(res, 'Cannot share bill with yourself');
    }

    // Check if bill is already shared with this user
    const existingShare = await sharedBillRepository.findOne({
      where: {
        bill: { id: bill.id },
        sharedWith: { id: sharedWithUser.id }
      }
    });

    if (existingShare) {
      if (existingShare.isActive) {
        return ApiResponse.badRequest(res, 'Bill is already shared with this user');
      } else {
        // Reactivate existing share
        existingShare.isActive = true;
        existingShare.permissionLevel = permissionLevel;
        existingShare.sharedAt = new Date();
        await sharedBillRepository.save(existingShare);
        
        logger.info('Bill sharing reactivated', { 
          billId: bill.id, 
          ownerId: userId, 
          sharedWithId: sharedWithUser.id 
        });
        
        return ApiResponse.success(res, 'Bill shared successfully', { sharedBill: existingShare });
      }
    }

    // Create new share
    const sharedBill = new SharedBill();
    sharedBill.bill = bill;
    sharedBill.owner = bill.user;
    sharedBill.sharedWith = sharedWithUser;
    sharedBill.permissionLevel = permissionLevel;
    sharedBill.isActive = true;
    sharedBill.sharedAt = new Date();

    const savedSharedBill = await sharedBillRepository.save(sharedBill);

    logger.info('Bill shared successfully', { 
      billId: bill.id, 
      ownerId: userId, 
      sharedWithId: sharedWithUser.id,
      sharedBillId: savedSharedBill.id
    });

    return ApiResponse.success(res, 'Bill shared successfully', { sharedBill: savedSharedBill }, 201);
  } catch (error) {
    logger.error('Error sharing bill:', error);
    next(error);
  }
};

export const getSharedBills = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { type } = req.query;

    if (!userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    const sharedBillRepository = AppDataSource.getRepository(SharedBill);
    let queryBuilder = sharedBillRepository.createQueryBuilder('shared_bill')
      .leftJoinAndSelect('shared_bill.bill', 'bill')
      .leftJoinAndSelect('shared_bill.owner', 'owner')
      .leftJoinAndSelect('shared_bill.sharedWith', 'sharedWith')
      .where('shared_bill.is_active = :isActive', { isActive: true });

    if (type === 'shared_by_me') {
      queryBuilder.andWhere('shared_bill.owner_id = :userId', { userId });
    } else if (type === 'shared_with_me') {
      queryBuilder.andWhere('shared_bill.shared_with_id = :userId', { userId });
    } else {
      // Return both types
      queryBuilder.andWhere('(shared_bill.owner_id = :userId OR shared_bill.shared_with_id = :userId)', { userId });
    }

    queryBuilder.orderBy('shared_bill.shared_at', 'DESC');
    const sharedBills = await queryBuilder.getMany();

    logger.info('Shared bills retrieved successfully', { 
      userId, 
      type,
      count: sharedBills.length 
    });

    return ApiResponse.success(res, 'Shared bills retrieved successfully', { 
      sharedBills,
      type: type || 'all'
    });
  } catch (error) {
    logger.error('Error retrieving shared bills:', error);
    next(error);
  }
};

export const updateSharedBill = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isActive, permissionLevel } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    if (!id || isNaN(parseInt(id))) {
      return ApiResponse.badRequest(res, 'Invalid shared bill ID');
    }

    const sharedBillRepository = AppDataSource.getRepository(SharedBill);
    const sharedBill = await sharedBillRepository.findOne({
      where: { 
        id: parseInt(id),
        owner: { id: userId } // Only owner can update shared bill
      },
      relations: ['owner', 'sharedWith', 'bill']
    });

    if (!sharedBill) {
      return ApiResponse.notFound(res, 'Shared bill not found or you do not have permission to modify it');
    }

    // Update fields
    if (isActive !== undefined) sharedBill.isActive = isActive;
    if (permissionLevel !== undefined) sharedBill.permissionLevel = permissionLevel;

    const updatedSharedBill = await sharedBillRepository.save(sharedBill);

    logger.info('Shared bill updated successfully', { 
      sharedBillId: sharedBill.id,
      ownerId: userId,
      changes: { isActive, permissionLevel }
    });

    return ApiResponse.success(res, 'Shared bill updated successfully', { sharedBill: updatedSharedBill });
  } catch (error) {
    logger.error('Error updating shared bill:', error);
    next(error);
  }
};

export const revokeSharedBill = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    if (!id || isNaN(parseInt(id))) {
      return ApiResponse.badRequest(res, 'Invalid shared bill ID');
    }

    const sharedBillRepository = AppDataSource.getRepository(SharedBill);
    const sharedBill = await sharedBillRepository.findOne({
      where: { 
        id: parseInt(id),
        owner: { id: userId }
      },
      relations: ['owner', 'sharedWith', 'bill']
    });

    if (!sharedBill) {
      return ApiResponse.notFound(res, 'Shared bill not found or you do not have permission to revoke it');
    }

    // Instead of deleting, set as inactive
    sharedBill.isActive = false;
    await sharedBillRepository.save(sharedBill);

    logger.info('Shared bill revoked successfully', { 
      sharedBillId: sharedBill.id,
      ownerId: userId
    });

    return ApiResponse.success(res, 'Bill sharing revoked successfully');
  } catch (error) {
    logger.error('Error revoking shared bill:', error);
    next(error);
  }
};

export const getSharedBillById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, 'User not authenticated');
    }

    if (!id || isNaN(parseInt(id))) {
      return ApiResponse.badRequest(res, 'Invalid shared bill ID');
    }

    const sharedBillRepository = AppDataSource.getRepository(SharedBill);
    const sharedBill = await sharedBillRepository.findOne({
      where: { 
        id: parseInt(id),
        isActive: true
      },
      relations: ['bill', 'owner', 'sharedWith']
    });

    if (!sharedBill) {
      return ApiResponse.notFound(res, 'Shared bill not found');
    }

    // Check if user has permission to view this shared bill
    const hasPermission = sharedBill.owner.id === userId || sharedBill.sharedWith.id === userId;
    
    if (!hasPermission) {
      return ApiResponse.forbidden(res, 'You do not have permission to view this shared bill');
    }

    logger.info('Shared bill retrieved successfully', { 
      sharedBillId: sharedBill.id,
      userId,
      billId: sharedBill.bill.id
    });

    return ApiResponse.success(res, 'Shared bill retrieved successfully', { sharedBill });
  } catch (error) {
    logger.error('Error retrieving shared bill:', error);
    next(error);
  }
};
