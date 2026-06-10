import { ERP_MAPPING } from '@/constants/ConstantsAndParams';

jest.mock('@/services/AxiosConfigService', () => ({
  __esModule: true,
  http: { get: jest.fn(), put: jest.fn() },
}));

import { http } from '@/services/AxiosConfigService';
import ErpFieldMappingService from '@/services/ErpFieldMappingService';

const mocked = http as unknown as { get: jest.Mock; put: jest.Mock };
const resolved = <T>(data: T) => Promise.resolve({ data });

describe('ErpFieldMappingService', () => {
  beforeEach(() => {
    mocked.get.mockReset();
    mocked.put.mockReset();
  });

  it('getMapping_forwardsEntityTypeAsQueryParam', async () => {
    mocked.get.mockReturnValueOnce(resolved([]));

    await ErpFieldMappingService.getMapping('PRODUCTION_ORDER');

    expect(mocked.get).toHaveBeenCalledWith('/erp/field-mapping', {
      params: { entityType: 'PRODUCTION_ORDER' },
      notificationConfig: { key: ERP_MAPPING.KEY, suppressErrorNotification: false },
    });
  });

  it('replaceMapping_PUTsTheReplacePayloadAndIncludesUpdatedSuccessTexts', async () => {
    mocked.put.mockReturnValueOnce(resolved([]));

    await ErpFieldMappingService.replaceMapping({
      entityType: 'PRODUCTION_ORDER',
      mappings: [{ njField: 'a', erpField: 'b', dataType: 'STRING', required: true }],
    });

    expect(mocked.put.mock.calls[0][0]).toBe('/erp/field-mapping');
    expect(mocked.put.mock.calls[0][2].notificationConfig).toMatchObject({
      successMessage: ERP_MAPPING.NOTIFICATIONS.SUCCESS.TITLES.UPDATED,
      successDescription: ERP_MAPPING.NOTIFICATIONS.SUCCESS.MESSAGES.UPDATED,
    });
  });

  it('rethrows the axios error', async () => {
    const boom = new Error('boom');
    mocked.get.mockRejectedValueOnce(boom);

    await expect(ErpFieldMappingService.getMapping('X')).rejects.toBe(boom);
  });
});
