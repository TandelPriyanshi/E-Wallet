import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Bill } from "./bill.entity";

@Entity("shared_bills")
export class SharedBill {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Bill, { onDelete: "CASCADE" })
    @JoinColumn({ name: "bill_id" })
    bill!: Bill;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "owner_id" })
    owner!: User; // User who owns/shares the bill

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "shared_with_id" })
    sharedWith!: User; // User who receives the shared bill

    @Column({ name: "permission_level", default: "view" })
    permissionLevel!: string; // 'view' only for now, could extend to 'edit' later

    @Column({ name: "is_active", default: true })
    isActive!: boolean; // Allow owners to revoke sharing

    @Column({
        name: "shared_at",
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP",
    })
    sharedAt!: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
