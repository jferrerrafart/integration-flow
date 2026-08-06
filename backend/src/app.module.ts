import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlowsModule } from './flows/flows.module';
import { ComponentDefinitionsModule } from './component-definitions/component-definitions.module';

@Module({
  imports: [FlowsModule, ComponentDefinitionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
