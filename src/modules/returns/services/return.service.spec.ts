import { ReturnService } from './return.service';

describe('ReturnService', () => {
  it('approves return through application service', async () => {
    const prisma = makePrisma();
    const approveUseCase = {
      execute: jest.fn(),
    };

    const service = new ReturnService(
      prisma as any,
      approveUseCase as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
    );

    await service.approve('return_1');

    expect(approveUseCase.execute).toHaveBeenCalledWith({
      returnId: 'return_1',
    });

    expect(prisma.return.findUnique).toHaveBeenCalledWith({
      where: { id: 'return_1' },
      include: {
        items: true,
        order: true,
      },
    });
  });

  it('rejects return through application service', async () => {
    const rejectUseCase = {
      execute: jest.fn(),
    };

    const service = new ReturnService(
      makePrisma() as any,
      { execute: jest.fn() } as any,
      rejectUseCase as any,
      { execute: jest.fn() } as any,
    );

    await service.reject('return_1');

    expect(rejectUseCase.execute).toHaveBeenCalledWith({
      returnId: 'return_1',
    });
  });

  it('refunds return through application service', async () => {
    const refundUseCase = {
      execute: jest.fn(),
    };

    const service = new ReturnService(
      makePrisma() as any,
      { execute: jest.fn() } as any,
      { execute: jest.fn() } as any,
      refundUseCase as any,
    );

    await service.refund('return_1');

    expect(refundUseCase.execute).toHaveBeenCalledWith({
      returnId: 'return_1',
    });
  });
});

function makePrisma() {
  return {
    return: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'return_1',
      }),
    },
  };
}
