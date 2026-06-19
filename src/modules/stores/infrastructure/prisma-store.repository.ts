import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StoreAggregate } from '../domain/store.aggregate';
import { StoreRepository } from '../domain/store.repository';

@Injectable()
export class PrismaStoreRepository implements StoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<StoreAggregate | null> {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        StoreSettings: true,
      },
    });

    return store ? this.toAggregate(store) : null;
  }

  async findBySlug(slug: string): Promise<StoreAggregate | null> {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: {
        StoreSettings: true,
      },
    });

    return store ? this.toAggregate(store) : null;
  }

  async save(aggregate: StoreAggregate): Promise<void> {
    const snapshot = aggregate.snapshot();

    await this.prisma.store.update({
      where: { id: snapshot.id },
      data: {
        name: snapshot.name,
        slug: snapshot.slug,
        StoreSettings: {
          upsert: {
            create: {
              currency: snapshot.currency,
            },
            update: {
              currency: snapshot.currency,
            },
          },
        },
      },
    });
  }

  private toAggregate(store: {
    id: string;
    name: string;
    slug: string;
    StoreSettings: {
      currency: string;
    } | null;
  }) {
    return StoreAggregate.create({
      id: store.id,
      name: store.name,
      slug: store.slug,
      status: 'active',
      defaultLanguage: 'bg',
      supportedLanguages: ['bg'],
      currency: store.StoreSettings?.currency ?? 'BGN',
    });
  }
}
