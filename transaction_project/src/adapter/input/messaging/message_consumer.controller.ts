import { Controller, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KafkaService } from './kafka.service';

// TODO: a consumer will be used soon.
@Controller()
export class MessageConsumerController
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    console.log('MessageConsumerController::onModuleInit');

  }

  async onModuleDestroy() {
  }
}
