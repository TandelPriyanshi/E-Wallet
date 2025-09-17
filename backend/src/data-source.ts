import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { Bill } from "./entities/bill.entity";
import { SharedBill } from "./entities/shared-bill.entity";
import { config } from "./config/config";
import logger from "./utils/logger";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: config.database.database,
    synchronize: config.server.env === "development", // Enable synchronize in development
    logging: config.server.env === "development" ? "all" : ["error"],
    logger: config.server.env === "development" ? "advanced-console" : "file",
    entities: [__dirname + "/entities/*.entity.{js,ts}"],
    migrations: [__dirname + "/migrations/*.{js,ts}"],
    subscribers: [],
    migrationsRun: false,
    dropSchema: false, // Disable schema dropping to preserve data
    migrationsTableName: "migrations",
});

// Enhanced connection with better error handling
export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        logger.info("SQLite database connection established successfully", {
            database: config.database.database,
        });
    } catch (error) {
        logger.error("Error during database initialization:", error);
        process.exit(1);
    }
};
