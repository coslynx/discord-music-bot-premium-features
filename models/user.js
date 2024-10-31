import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Playlist } from './playlist';
import { Subscription } from './subscription';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  favoriteGenres: string;

  @Column({ nullable: true })
  theme: 'light' | 'dark';

  @Column({ nullable: true })
  preferredMusicSource: 'spotify' | 'youtube' | 'deezer';

  @Column({ nullable: true })
  defaultVolume: number;

  @Column({ nullable: true, default: false })
  queueUpdates: boolean;

  @Column({ nullable: true, default: false })
  playbackStart: boolean;

  @Column({ nullable: true, default: false })
  playbackEnd: boolean;

  @OneToMany(() => Playlist, (playlist) => playlist.user)
  playlists: Playlist[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];
}