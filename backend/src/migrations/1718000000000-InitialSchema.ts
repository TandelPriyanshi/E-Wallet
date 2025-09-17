import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1718000000000 implements MigrationInterface {
    name = 'InitialSchema1718000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create migrations table if it doesn't exist
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "migrations" (
                "id" SERIAL PRIMARY KEY,
                "timestamp" bigint NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "UQ_8bbaa17e5e3aac710a2e1bcaa79" UNIQUE ("name")
            )
        `);

        // Drop existing tables if they exist
        await queryRunner.query(`DROP TABLE IF EXISTS "bill" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);

        // Create user table
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL PRIMARY KEY,
                "email" character varying NOT NULL,
                "username" character varying NOT NULL,
                "password" character varying NOT NULL,
                "first_name" character varying(100),
                "last_name" character varying(100),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")
            )
        `);

        // Create bill table
        await queryRunner.query(`
            CREATE TABLE "bill" (
                "id" SERIAL PRIMARY KEY,
                "filename" character varying NOT NULL,
                "path" character varying NOT NULL,
                "raw_text" text,
                "metadata" jsonb,
                "product_name" character varying,
                "purchase_date" date,
                "warranty_period" integer,
                "category" character varying,
                "notes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" integer,
                CONSTRAINT "FK_bill_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bill" CASCADE`);
        await queryRunner.query(`DROP TABLE "user" CASCADE`);
    }
}
