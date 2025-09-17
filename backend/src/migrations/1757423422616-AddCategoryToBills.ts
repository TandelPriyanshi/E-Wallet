import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryToBills1757423422616 implements MigrationInterface {
    name = 'AddCategoryToBills1757423422616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bill" DROP CONSTRAINT "FK_bill_user"`);
        await queryRunner.query(`ALTER TABLE "bill" ADD "category" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb"`);
        await queryRunner.query(`ALTER TABLE "bill" ADD CONSTRAINT "FK_34e537d6261c55286aa58921ada" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bill" DROP CONSTRAINT "FK_34e537d6261c55286aa58921ada"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "bill" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "bill" ADD CONSTRAINT "FK_bill_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
