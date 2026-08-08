import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service'
import { FlowsModule } from './flows/flows.module';
import { ComponentDefinitionModule } from './component-definition/component-definition.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [FlowsModule, ComponentDefinitionModule, TypeOrmModule.forRoot({ type: 'sqlite', database: 'database.sqlite', autoLoadEntities: true, synchronize: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
