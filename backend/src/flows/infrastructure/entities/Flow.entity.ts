import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { FlowComponent } from './FlowComponent.entity';

@Entity()
export class Flow {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column({ unique: true })
    name!: string;

    @OneToMany(() => FlowComponent, (component) => component.flow, {
        cascade: true,
    })
    components!: FlowComponent[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}