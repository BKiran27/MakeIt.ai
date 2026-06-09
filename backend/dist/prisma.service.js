"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const mock_db_1 = require("./mock-db");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    logger = new common_1.Logger(PrismaService_1.name);
    mockDb = new mock_db_1.MockDb();
    isMock = false;
    constructor() {
        super();
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (target.isMock) {
                    if (prop in target.mockDb) {
                        return target.mockDb[prop];
                    }
                    if (typeof prop === 'string' && prop.startsWith('$')) {
                        return target.mockDb[prop].bind(target.mockDb);
                    }
                }
                return Reflect.get(target, prop, receiver);
            }
        });
    }
    async onModuleInit() {
        try {
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl || dbUrl.includes('placeholder')) {
                throw new Error('No DATABASE_URL configured');
            }
            await this.$connect();
            this.logger.log('Successfully connected to the database.');
        }
        catch (error) {
            this.isMock = true;
            this.logger.warn('Database connection failed. Operating in Mock In-Memory Database Mode for demo/preview purposes.');
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map