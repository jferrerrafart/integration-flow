import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { FlowService } from './flow.service';
import { FlowDto } from '../dto/flow.dto';
import { FlowResponseDto } from '../dto/flow-response.dto';
import { getHttpErrorMessage } from '../../shared/utils/http-error.util';

@Injectable({
    providedIn: 'root',
})
export class FlowFacade {
    private readonly service = inject(FlowService);
    readonly flows = signal<FlowResponseDto[]>([]);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    async loadAll(): Promise<void> {
        this.loading.set(true);
        this.error.set(null);

        try {
            const flows = await firstValueFrom(this.service.getAll());
            this.flows.set(flows);
        } catch (error) {
            this.error.set(getHttpErrorMessage(
                error,
                'Unable to load flows',
            ));
            throw error;
        } finally {
            this.loading.set(false);
        }
    }

    async getOne(id: number): Promise<FlowResponseDto> {
        return firstValueFrom(this.service.getOne(id));
    }

    async create(dto: FlowDto): Promise<FlowResponseDto> {
        const created = await firstValueFrom(this.service.create(dto));
        await this.loadAll();

        return created;
    }

    async update(id: number, dto: FlowDto): Promise<FlowResponseDto> {
        const updated = await firstValueFrom(this.service.update(id, dto));
        await this.loadAll();

        return updated;
    }

    async remove(id: number): Promise<void> {
        await firstValueFrom(this.service.remove(id));
        await this.loadAll();
    }
}
