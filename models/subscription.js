import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  subscriptionId: number;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  plan: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  subscriptionDate: Date;

  @Column({ type: 'timestamp' })
  expirationDate: Date;
}