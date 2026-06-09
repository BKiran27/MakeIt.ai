import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class AuthGuard implements CanActivate {
    private configService;
    private jwtSecret;
    constructor(configService: ConfigService);
    canActivate(context: ExecutionContext): boolean;
}
