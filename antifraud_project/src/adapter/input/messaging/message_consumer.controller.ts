import { Controller, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { MessagingService } from '../../input_output/messaging/messaging.service';
import { AntifraudCheckPayload } from '../../../domain/models/events/antifraud_check.payload';
import { FraudAnalysisUsecase } from '../../../domain/usecases/fraud_analysis.usecase';

@Controller()
export class MessageConsumerController
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private readonly configService: ConfigService,
    private readonly fraudAnalysisUsecase: FraudAnalysisUsecase,
    private readonly messagingService: MessagingService,
  ) {}

  async onModuleInit() {
    Logger.log('MessageConsumerController::onModuleInit');

    const consumer = this.messagingService.getConsumer();
    await consumer.connect();

    // Consumers
    Logger.log('MessageConsumerController - consumers');

    // Consumer for topic "antifraud-check"
    const antifraudCheckTopic = this.configService.get(
      'application.transport.event-driven.kafka.topics.antifraud-check',
    );

    this.messagingService.addTopicConsumer(antifraudCheckTopic, (msg) => {
      const checkPayload: AntifraudCheckPayload = JSON.parse(
        msg.value.toString(),
      );

      Logger.log(
        `>> ANTIFRAUD AntifraudConsumerController: read incoming message ` +
          `${JSON.stringify(checkPayload)}`,
      );

      const transactionId: string = checkPayload.transactionId;
      this.fraudAnalysisUsecase.analyze(transactionId);
    });

    this.messagingService.initializeConsumers();
  }

  async onModuleDestroy() {
    this.messagingService.getConsumer().disconnect();
  }
}
