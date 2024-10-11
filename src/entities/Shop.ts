import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'shops' })
export class Shop {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    shop_id!: string;

    @Column()
    shop_url!: string;

    @Column()
    access_token!: string;

    @Column()
    refresh_token!: string;

    @Column({ type: 'datetime' })
    token_expires!: Date;

    @Column()
    action!: string;

    @Column()
    application_code!: string;

    @Column()
    application_version!: string;

    @Column()
    trial!: string;

    @Column()
    hash!: string;

    @Column({ type: 'datetime' })
    timestamp!: Date;
}