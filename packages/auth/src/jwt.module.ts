import { DynamicModule, Global, Module } from "@nestjs/common"
import { JWT_OPTIONS } from "./jwt.constants"
import { JwtService } from "./jwt.service"
import type { JwtModuleAsyncOptions, JwtModuleOptions } from "./jwt.types"

@Global()
@Module({})
export class JwtModule {
  static register(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        { provide: JWT_OPTIONS, useValue: options },
        JwtService,
      ],
      exports: [JwtService],
    }
  }

  static registerAsync(asyncOptions: JwtModuleAsyncOptions): DynamicModule {
    return {
      module: JwtModule,
      imports: asyncOptions.imports ?? [],
      providers: [
        {
          provide: JWT_OPTIONS,
          useFactory: asyncOptions.useFactory,
          inject: asyncOptions.inject ?? [],
        },
        JwtService,
      ],
      exports: [JwtService],
    }
  }
}
