import { ViolationReportDto } from '@app/shared/dto/violations/violation-report.dto';
import APITransport from './api-transport';

export default class ViolationsAPI {
  private readonly transport: APITransport;

  constructor(transport: APITransport) {
    this.transport = transport.atPath('violations');
  }

	async reportViolation(report: ViolationReportDto) {
		await this.transport.authPost('', report);
	}
}
