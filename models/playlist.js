import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user';
import { Song } from './song';

@Entity()
export class Playlist {
  @PrimaryGeneratedColumn()
  playlistId: number;

  @ManyToOne(() => User, (user) => user.playlists)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Song, (song) => song.playlist)
  @JoinColumn({ name: 'playlistId' })
  songs: Song[];
}