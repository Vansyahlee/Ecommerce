import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/infra/database/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    let finalSku = createProductDto.sku;
    if (!finalSku) {
      const cat = (createProductDto.category || 'GEN').substring(0, 3).toUpperCase();
      finalSku = `VNZ-${cat}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return await this.prisma.product.create({
      data: {
        ...createProductDto,
        sku: finalSku,
        expiryDate: createProductDto.expiryDate ? new Date(createProductDto.expiryDate) : null,
      },
    });
  }

  async findAll() {
    return await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return await this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        expiryDate: updateProductDto.expiryDate ? new Date(updateProductDto.expiryDate) : undefined,
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
