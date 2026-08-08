import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, } from 'typeorm';
import { FlowComponentRole } from '../../../shared/enums/flow-component-role.enum';
import { ManyToOne, JoinColumn } from 'typeorm';
import { Flow } from './Flow.entity';


@Entity()
export class FlowComponent {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Flow, (flow) => flow.components, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'flowId',
    })
    flow!: Flow;

    @Column({ type: 'text' })
    role!: FlowComponentRole;

    @Column()
    componentId!: string;

    @Column()
    position!: number;

    @Column({ type: 'simple-json' })
    configuration!: Record<string, unknown>;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}