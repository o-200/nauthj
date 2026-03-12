import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 64 })
  @Index({ unique: true })
  login: string

  @Column({ length: 64 })
  @Index({ unique: true })
  email: string

  @Column({ length: 64 })
  password: string

  @Column("int")
  age: number

  @Column("varchar", { length: 1000 })
  description: string

  @Column({ type: 'text', nullable: true })
  refreshToken: string
}
