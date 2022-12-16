import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransactionService } from 'src/adapter/output/db/transaction.service';
import { Transaction } from '../models/transaction.interface';
import { AntifraudAnalysisResponsePayload } from './antifraud_analysis_response.payload';
import { MessagingService } from 'src/adapter/input_output/messaging/messaging.service';
import { TransactionStatus } from '../models/transaction_status.enum';
import { map } from 'rxjs';

@Injectable()
export class FraudAnalysisUsecase {
  private analysisResponseTopic: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly transactionService: TransactionService,
    private readonly messagingService: MessagingService,
  ) {}

  analyze(transactionId: string) {
    console.log(
      'FraudAnalysisUsecase analyze() transactionId: ' + transactionId,
    );

    this.transactionService.findById(transactionId).subscribe(
      (tx) => {
        console.log(
          'FraudAnalysisUsecase analyze:: record: ' + JSON.stringify(tx),
        );

        const newStatus = this.getStatus(tx);

        const payload: AntifraudAnalysisResponsePayload = {
          transactionId: tx.transactionExternalId,
          version: tx.version,
          newStatus,
        };

        console.log(
          'FraudAnalysisUsecase: send antifraud analysis to Transaction: ' +
            JSON.stringify(payload),
        );

        this.messagingService.notifyTransactionSystem(payload);
        //return tx;
      });
  }

  getStatus(transaction: Transaction): TransactionStatus {
    const maxAmount = this.configService.get<number>(
      'application.business.transaction.max-amount',
    );
    const result =
      transaction.value > maxAmount
        ? TransactionStatus.rejected
        : TransactionStatus.approved;

    console.log('FraudAnalysisUsecase newStatus: ' + result);
    return result;
  }
}
