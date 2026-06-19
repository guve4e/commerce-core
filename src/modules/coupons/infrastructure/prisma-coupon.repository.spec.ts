import { CouponAggregate } from '../domain/coupon.aggregate';
import { CouponStatus } from '../domain/coupon-status.enum';
import { PrismaCouponRepository } from './prisma-coupon.repository';

describe('PrismaCouponRepository', () => {
  it('finds coupon by id', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCouponRepository(prisma as any);

    const aggregate = await repository.findById('coupon_1');

    expect(prisma.couponCode.findUnique).toHaveBeenCalledWith({
      where: { id: 'coupon_1' },
    });

    expect(aggregate).toBeInstanceOf(CouponAggregate);
    expect(aggregate?.snapshot()).toEqual({
      id: 'coupon_1',
      code: 'SAVE10',
      active: true,
      maxUses: 10,
      usedCount: 0,
      expiresAt: null,
      status: CouponStatus.ACTIVE,
    });
  });

  it('finds coupon by code', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCouponRepository(prisma as any);

    const aggregate = await repository.findByCode('SAVE10');

    expect(prisma.couponCode.findUnique).toHaveBeenCalledWith({
      where: { code: 'SAVE10' },
    });

    expect(aggregate?.status).toBe(CouponStatus.ACTIVE);
  });

  it('maps inactive coupon as disabled', async () => {
    const prisma = makePrisma();
    prisma.couponCode.findUnique.mockResolvedValueOnce({
      id: 'coupon_1',
      code: 'SAVE10',
      active: false,
      maxUses: 10,
      usedCount: 0,
      expiresAt: null,
    });

    const repository = new PrismaCouponRepository(prisma as any);

    const aggregate = await repository.findById('coupon_1');

    expect(aggregate?.status).toBe(CouponStatus.DISABLED);
  });

  it('returns null when coupon is missing', async () => {
    const prisma = makePrisma();
    prisma.couponCode.findUnique.mockResolvedValueOnce(null);

    const repository = new PrismaCouponRepository(prisma as any);

    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('saves coupon aggregate', async () => {
    const prisma = makePrisma();
    const repository = new PrismaCouponRepository(prisma as any);

    const aggregate = new CouponAggregate({
      id: 'coupon_1',
      code: 'SAVE10',
      active: true,
      maxUses: 10,
      usedCount: 0,
      expiresAt: null,
      status: CouponStatus.ACTIVE,
    });

    aggregate.apply();

    await repository.save(aggregate);

    expect(prisma.couponCode.update).toHaveBeenCalledWith({
      where: { id: 'coupon_1' },
      data: {
        active: true,
        usedCount: 1,
      },
    });
  });

  it('requires coupon id when saving', async () => {
    const repository = new PrismaCouponRepository(makePrisma() as any);

    const aggregate = new CouponAggregate({
      active: true,
      maxUses: 10,
      usedCount: 0,
      expiresAt: null,
      status: CouponStatus.ACTIVE,
    });

    await expect(repository.save(aggregate)).rejects.toThrow(
      'Coupon id is required to save',
    );
  });
});

function makePrisma() {
  return {
    couponCode: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'coupon_1',
        code: 'SAVE10',
        active: true,
        maxUses: 10,
        usedCount: 0,
        expiresAt: null,
      }),
      update: jest.fn(),
    },
  };
}
