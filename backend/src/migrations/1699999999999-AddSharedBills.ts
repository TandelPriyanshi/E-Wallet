import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSharedBills1699999999999 implements MigrationInterface {
    name = 'AddSharedBills1699999999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add category column to bill table (if not exists)
        await queryRunner.query(`ALTER TABLE "bill" ADD COLUMN IF NOT EXISTS "category" VARCHAR(255)`);

        // Create shared_bills table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "shared_bills" (
                "id" SERIAL PRIMARY KEY,
                "bill_id" INTEGER NOT NULL REFERENCES "bill"("id") ON DELETE CASCADE,
                "owner_id" INTEGER NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
                "shared_with_id" INTEGER NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
                "permission_level" VARCHAR(20) DEFAULT 'view',
                "is_active" BOOLEAN DEFAULT true,
                "shared_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("bill_id", "shared_with_id")
            );
        `);

        // Indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_shared_bills_owner_id" ON "shared_bills" ("owner_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_shared_bills_shared_with_id" ON "shared_bills" ("shared_with_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_shared_bills_bill_id" ON "shared_bills" ("bill_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_shared_bills_is_active" ON "shared_bills" ("is_active")`);

        // Trigger for updated_at
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_trigger WHERE tgname = 'update_shared_bills_updated_at'
                ) THEN
                    CREATE TRIGGER update_shared_bills_updated_at
                    BEFORE UPDATE ON "shared_bills"
                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_shared_bills_updated_at ON "shared_bills"`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
        await queryRunner.query(`DROP TABLE IF EXISTS "shared_bills"`);
        // We won't drop the category column to avoid data loss; if needed, uncomment below
        // await queryRunner.query(`ALTER TABLE "bill" DROP COLUMN IF EXISTS "category"`);
    }
}

