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

// Define interfaces for bill data structure
export interface BillItem {
    description: string;
    quantity?: string;
    unitPrice?: string;
    amount?: string;
}

export interface BillMetadata {
    totalAmount?: string;
    date?: string;
    vendorName?: string;
    items?: BillItem[];
}

@Entity()
export class Bill {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    filename!: string;

    @Column()
    path!: string;

    @Column({ name: "raw_text", type: "text", nullable: true })
    rawText!: string;

    @Column({ type: "text", nullable: true })
    metadata!: BillMetadata;

    @Column({ name: "product_name", nullable: true })
    productName!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;

    @Column({ name: "purchase_date", type: "date", nullable: true })
    purchaseDate!: string;

    @Column({ name: "warranty_period", type: "integer", nullable: true })
    warrantyPeriod!: number; // in months

    @Column({ type: "text", nullable: true })
    notes!: string;

    @Column({ nullable: true })
    category!: string;

    @ManyToOne(() => User, (user: User) => user.bills, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;
}
