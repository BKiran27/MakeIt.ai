"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const projects_controller_1 = require("./projects.controller");
const projects_service_1 = require("./projects.service");
const prisma_service_1 = require("../prisma.service");
const ai_module_1 = require("../ai/ai.module");
const auth_module_1 = require("../auth/auth.module");
let ProjectsModule = class ProjectsModule {
};
exports.ProjectsModule = ProjectsModule;
exports.ProjectsModule = ProjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, ai_module_1.AiModule, auth_module_1.AuthModule],
        controllers: [projects_controller_1.ProjectsController],
        providers: [projects_service_1.ProjectsService, prisma_service_1.PrismaService],
    })
], ProjectsModule);
//# sourceMappingURL=projects.module.js.map