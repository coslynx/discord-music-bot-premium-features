import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Song {
  @PrimaryGeneratedColumn()
  songId: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  artist: string;

  @Column({ nullable: false })
  url: string;

  @Column({ nullable: false })
  duration: number;

  @Column({ type: 'int', default: 0 })
  playCount: number;
}