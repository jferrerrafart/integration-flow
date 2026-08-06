import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service'
import { FlowsModule } from './flows/flows.module';
import { ComponentDefinitionsModule } from './component-definitions/component-definitions.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [FlowsModule, ComponentDefinitionsModule, TypeOrmModule.forRoot({ type: 'sqlite', database: 'database.sqlite', autoLoadEntities: true, synchronize: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
