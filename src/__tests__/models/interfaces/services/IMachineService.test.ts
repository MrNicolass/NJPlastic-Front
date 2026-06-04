import type { Schemas } from '@/api/types';
import type { IMachineService } from '@/models/interfaces/services/IMachineService';
import type { Page } from '@/models/types/Page';
import type { PageParams } from '@/models/types/PageParams';
import type { ProductionCycleResponse } from '@/models/types/ProductionCycleResponse';

describe('IMachineService', () => {
  const emptyPage: Page<ProductionCycleResponse> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    numberOfElements: 0,
    empty: true,
  };

  const stub: IMachineService = {
    listMachines: jest.fn(async () => [] as Schemas['MachineSummaryDTO'][]),
    getStatus: jest.fn(async () => ({}) as Schemas['MachineStatusResponseDTO']),
    getCycles: jest.fn(async () => emptyPage),
    registerPause: jest.fn(async () => ({}) as Schemas['MachineStatusEntryDTO']),
    editStopMessage: jest.fn(async () => ({}) as Schemas['MachineStatusEntryDTO']),
    getOee: jest.fn(async () => ({}) as Schemas['OeeResultDTO']),
    registerQuality: jest.fn(async () => ({}) as Schemas['QualityRecord']),
    getShiftReport: jest.fn(async () => ({}) as Schemas['ShiftReportResponseDTO']),
  };

  it('declares every machine-bound method', () => {
    expect(typeof stub.listMachines).toBe('function');
    expect(typeof stub.getStatus).toBe('function');
    expect(typeof stub.getCycles).toBe('function');
    expect(typeof stub.registerPause).toBe('function');
    expect(typeof stub.editStopMessage).toBe('function');
    expect(typeof stub.getOee).toBe('function');
    expect(typeof stub.registerQuality).toBe('function');
    expect(typeof stub.getShiftReport).toBe('function');
  });

  it('propagates the suppressError flag and the request shape', async () => {
    const pageable: PageParams = { page: 0, size: 20 };

    await stub.listMachines(true);
    await stub.getStatus('machine-1', 'from', 'to', true);
    await stub.getCycles(pageable, 'machine-1', false);
    await stub.registerPause('machine-1', 'maintenance', false);
    await stub.editStopMessage('machine-1', 'stop-1', 'message', true);
    await stub.getOee('machine-1', 'from', 'to');
    await stub.registerQuality('machine-1', {} as Schemas['QualityRegistrationRequestDTO']);
    await stub.getShiftReport('from', 'to', 'sector', 'A', true);

    expect(stub.listMachines).toHaveBeenCalledWith(true);
    expect(stub.getStatus).toHaveBeenCalledWith('machine-1', 'from', 'to', true);
    expect(stub.getCycles).toHaveBeenCalledWith(pageable, 'machine-1', false);
    expect(stub.registerPause).toHaveBeenCalledWith('machine-1', 'maintenance', false);
    expect(stub.editStopMessage).toHaveBeenCalledWith('machine-1', 'stop-1', 'message', true);
    expect(stub.getShiftReport).toHaveBeenCalledWith('from', 'to', 'sector', 'A', true);
  });
});
