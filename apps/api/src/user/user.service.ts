import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common"
import * as bcrypt from "bcryptjs"
import { PrismaService } from "../prisma.service"
import type { RegisterInput, UpdateProfileInput } from "@workspace/validation/user"

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: RegisterInput) {
    if (!data.role) {
      throw new BadRequestException("Role wajib diisi")
    }

    const existing = await this.prisma.client.user.findUnique({
      where: { email: data.email },
    })
    if (existing) {
      throw new ConflictException("Email sudah terdaftar")
    }

    const hashed = await bcrypt.hash(data.password, 10)
    return this.prisma.client.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashed,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findAll() {
    return this.prisma.client.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findById(id: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) throw new NotFoundException("User tidak ditemukan")
    return user
  }

  async update(id: string, data: UpdateProfileInput) {
    await this.findById(id)

    const updateData: Record<string, string> = {}
    if (data.username !== undefined) updateData.username = data.username
    if (data.status !== undefined) updateData.status = data.status
    if (data.role !== undefined) updateData.role = data.role
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10)

    return this.prisma.client.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async remove(id: string) {
    await this.findById(id)
    return this.prisma.client.user.delete({
      where: { id },
      select: { id: true, email: true, username: true, role: true },
    })
  }
}
