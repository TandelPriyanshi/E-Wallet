import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { config } from '../config/config';
import logger from '../utils/logger';

// Extend the Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

interface RegisterRequest extends Request {
  body: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const registerUser = async (
  req: RegisterRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with all available fields
    const user = new User();
    user.email = email;
    user.username = req.body.username;
    user.password = hashedPassword;
    
    // Set optional fields if provided
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;

    const savedUser = await userRepository.save(user);

    logger.info('User registered successfully', { userId: savedUser.id, email });

    // Generate JWT token with proper options
    const token = jwt.sign(
      { id: savedUser.id, email: savedUser.email },
      config.jwt.secret as string,
      { expiresIn: '24h' }
    );

    // Prepare user data for response (exclude sensitive information)
    const userResponse = {
      id: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    };
    
    // Use success response with 201 status code
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: userResponse
      }
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    next(error);
  }
};

export const loginUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    // Find user by email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret as string,
      { expiresIn: '24h' }
    );

    // Omit password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword
      }
    });
  } catch (error) {
    logger.error('Error logging in user:', error);
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ 
      where: { id: req.user?.id },
      select: ['id', 'email', 'username', 'firstName', 'lastName', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    logger.error('Error getting current user:', error);
    next(error);
  }
};
