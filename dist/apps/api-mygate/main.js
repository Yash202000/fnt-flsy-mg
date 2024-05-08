/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const app_controller_1 = __webpack_require__(7);
const app_service_1 = __webpack_require__(19);
const devices_module_1 = __webpack_require__(20);
const mygate_cards_module_1 = __webpack_require__(30);
const mygate_module_1 = __webpack_require__(34);
const config_1 = __webpack_require__(14);
const schedule_1 = __webpack_require__(36);
const mainflux_module_1 = __webpack_require__(28);
const mygate_logs_module_1 = __webpack_require__(38);
const prisma_client_mygate_1 = __webpack_require__(10);
const mygate_logs_service_1 = __webpack_require__(40);
const mygate_service_1 = __webpack_require__(35);
const mainflux_service_1 = __webpack_require__(23);
const auth_module_1 = __webpack_require__(29);
const auth_service_1 = __webpack_require__(9);
const communication_module_1 = __webpack_require__(42);
const user_module_1 = __webpack_require__(49);
const jwt_1 = __webpack_require__(17);
let AppModule = exports.AppModule = class AppModule {
};
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            schedule_1.ScheduleModule.forRoot(),
            devices_module_1.DevicesModule,
            mygate_cards_module_1.MyGateCardsModule,
            mygate_module_1.MyGateModule,
            mainflux_module_1.MainFluxModule,
            mygate_logs_module_1.MyGateLogsModule,
            prisma_client_mygate_1.PrismaClientMygateModule,
            auth_module_1.AuthModule,
            communication_module_1.CommunicationModule,
            user_module_1.UserModule,
            jwt_1.JwtModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            mygate_logs_service_1.MyGateLogsService,
            mygate_service_1.MyGateService,
            mainflux_service_1.MainFluxService,
            auth_service_1.AuthService,
        ],
    })
], AppModule);


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const auth_guard_1 = __webpack_require__(8);
let AppController = exports.AppController = class AppController {
};
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)()
], AppController);


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthGuard = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(9);
let AuthGuard = exports.AuthGuard = class AuthGuard {
    constructor(authService) {
        this.authService = authService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        return this.authService.validateDeviceRequest(request);
    }
};
exports.AuthGuard = AuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthGuard);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(6);
const prisma_client_mygate_1 = __webpack_require__(10);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(14);
const bcrypt = tslib_1.__importStar(__webpack_require__(15));
const env_consts_1 = __webpack_require__(16);
const jwt_1 = __webpack_require__(17);
const jwt = tslib_1.__importStar(__webpack_require__(18));
let AuthService = exports.AuthService = class AuthService {
    constructor(configService, prismaService, jwt) {
        this.configService = configService;
        this.prismaService = prismaService;
        this.jwt = jwt;
    }
    async hashPassword(password) {
        const saltRounds = Number(this.configService.get('bcrypt.saltRounds'));
        return await bcrypt.hash(password, saltRounds);
    }
    comparePasswords(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
    async validateDeviceRequest(request) {
        const deviceId = request.params.deviceId;
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: deviceId,
            },
        });
        if (!device) {
            return false;
        }
        if (device.isDeviceKeyExempt) {
            return true;
        }
        const deviceKey = request.headers['device-key'];
        const device_Id = request.headers['device-id'];
        if (deviceKey == undefined ||
            device_Id == undefined ||
            device_Id != deviceId) {
            return false;
        }
        return await this.comparePasswords(deviceKey, device.deviceKey);
    }
    async validateBearerToken(request) {
        const authheader = request.headers.authorization;
        if (!authheader) {
            throw new common_1.HttpException('Auth header is missing', common_1.HttpStatus.UNAUTHORIZED);
        }
        const secret = this.configService.get('USER_TOKEN');
        if (authheader && authheader.startsWith('Bearer ')) {
            const token = authheader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, secret);
                const decodedJSONString = JSON.stringify(decoded);
                const finaldata = JSON.parse(decodedJSONString);
                const user = await this.prismaService.user.findFirst({
                    where: {
                        email: finaldata.email
                    }
                });
                if (!user) {
                    throw new common_1.ForbiddenException("Invalid Token");
                }
                return true;
            }
            catch (error) {
                throw new common_1.HttpException(error, common_1.HttpStatus.UNAUTHORIZED);
            }
        }
        else {
            throw new common_1.ForbiddenException("Authorization header must start with Bearer");
        }
    }
    async validateUserRequest(request) {
        const apiKey = request.headers['api-key'];
        return apiKey != undefined && apiKey == env_consts_1.DASHBOARD_API_KEY;
    }
    async createToken(username, email) {
        const payload = {
            name: username,
            email
        };
        const secret = this.configService.get('USER_TOKEN');
        const token = await this.jwt.signAsync(payload, { expiresIn: '10m', secret: secret });
        return {
            access_token: token,
        };
    }
};
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof prisma_client_mygate_1.PrismaService !== "undefined" && prisma_client_mygate_1.PrismaService) === "function" ? _b : Object, typeof (_c = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _c : Object])
], AuthService);
function next() {
    throw new Error('Function not implemented.');
}


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Prisma = void 0;
const tslib_1 = __webpack_require__(6);
tslib_1.__exportStar(__webpack_require__(11), exports);
var mygate_1 = __webpack_require__(12);
Object.defineProperty(exports, "Prisma", ({ enumerable: true, get: function () { return mygate_1.Prisma; } }));
tslib_1.__exportStar(__webpack_require__(13), exports);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const mygate_1 = __webpack_require__(12);
let PrismaService = exports.PrismaService = class PrismaService extends mygate_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
};
exports.PrismaService = PrismaService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], PrismaService);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("@prisma/client/mygate");

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PrismaClientMygateModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const prisma_service_1 = __webpack_require__(11);
let PrismaClientMygateModule = exports.PrismaClientMygateModule = class PrismaClientMygateModule {
};
exports.PrismaClientMygateModule = PrismaClientMygateModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [],
        providers: [prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], PrismaClientMygateModule);


/***/ }),
/* 14 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DASHBOARD_API_KEY = exports.PORT = exports.API_URL = exports.MQTT_MAX_RETRY_COUNT = exports.MQTT_PASSWORD = exports.MQTT_USERNAME = exports.MQTT_PORT_MYGATE = exports.MQTT_HTTP_PROTOCOL_MYGATE = exports.MQTT_DOMAIN_MYGATE = exports.DEVICE_SYNC_BATCH_SIZE = exports.DEVICE_SYNC_CRON = exports.MYGATE_SYNC_CRON = exports.MYGATE_API_KEY = exports.MYGATE_API_URL = void 0;
exports.MYGATE_API_URL = process.env.MYGATE_API_URL;
exports.MYGATE_API_KEY = process.env.MYGATE_API_KEY;
exports.MYGATE_SYNC_CRON = process.env.MYGATE_SYNC_CRON;
exports.DEVICE_SYNC_CRON = process.env.DEVICE_SYNC_CRON;
exports.DEVICE_SYNC_BATCH_SIZE = Number(process.env.DEVICE_SYNC_BATCH_SIZE);
exports.MQTT_DOMAIN_MYGATE = process.env.MQTT_DOMAIN_MYGATE;
exports.MQTT_HTTP_PROTOCOL_MYGATE = process.env.MQTT_HTTP_PROTOCOL_MYGATE;
exports.MQTT_PORT_MYGATE = process.env.MQTT_PORT_MYGATE;
exports.MQTT_USERNAME = process.env.MQTT_USERNAME;
exports.MQTT_PASSWORD = process.env.MQTT_PASSWORD;
exports.MQTT_MAX_RETRY_COUNT = Number(process.env.MQTT_MAX_RETRY_COUNT);
exports.API_URL = process.env.API_URL;
exports.PORT = process.env.PORT;
exports.DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY;


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
let AppService = exports.AppService = class AppService {
};
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DevicesModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const devices_controller_1 = __webpack_require__(21);
const devices_service_1 = __webpack_require__(22);
const prisma_client_mygate_1 = __webpack_require__(10);
const mainflux_module_1 = __webpack_require__(28);
const mainflux_service_1 = __webpack_require__(23);
const auth_module_1 = __webpack_require__(29);
const auth_service_1 = __webpack_require__(9);
const config_1 = __webpack_require__(14);
const jwt_1 = __webpack_require__(17);
let DevicesModule = exports.DevicesModule = class DevicesModule {
};
exports.DevicesModule = DevicesModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_client_mygate_1.PrismaClientMygateModule, mainflux_module_1.MainFluxModule, auth_module_1.AuthModule],
        controllers: [devices_controller_1.DevicesController],
        providers: [devices_service_1.DevicesService, mainflux_service_1.MainFluxService, auth_service_1.AuthService, jwt_1.JwtService, config_1.ConfigService],
    })
], DevicesModule);


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DevicesController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const devices_service_1 = __webpack_require__(22);
const device_dto_1 = __webpack_require__(26);
const swagger_1 = __webpack_require__(4);
const auth_guard_1 = __webpack_require__(8);
const user_auth_guard_1 = __webpack_require__(27);
let DevicesController = exports.DevicesController = class DevicesController {
    constructor(deviceService) {
        this.deviceService = deviceService;
    }
    getDevices() {
        return this.deviceService.getDevices();
    }
    getDevice(id) {
        return this.deviceService.getDevice(+id);
    }
    addDevice(device) {
        return this.deviceService.addDevice(device);
    }
    editDevice(id, device) {
        return this.deviceService.editDevice(+id, device);
    }
    deleteDevice(id) {
        return this.deviceService.deleteDevice(); //+id
    }
};
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all the devices' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: [device_dto_1.DeviceDto] }),
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], DevicesController.prototype, "getDevices", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get device information by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Example ID: 1' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: device_dto_1.DeviceDto }),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], DevicesController.prototype, "getDevice", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create device api' }),
    (0, swagger_1.ApiBody)({ type: device_dto_1.AddDeviceDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Success',
        type: device_dto_1.returnDevicePostDto,
    }),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof device_dto_1.AddDeviceDto !== "undefined" && device_dto_1.AddDeviceDto) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], DevicesController.prototype, "addDevice", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Edit device Information' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Example ID: 1' }),
    (0, swagger_1.ApiBody)({ type: device_dto_1.EditDeviceDto }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.ACCEPTED,
        description: 'Success',
        type: device_dto_1.DeviceDto,
    }),
    (0, common_1.Put)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, typeof (_e = typeof device_dto_1.EditDeviceDto !== "undefined" && device_dto_1.EditDeviceDto) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], DevicesController.prototype, "editDevice", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete device information api' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Example ID: 1' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'No Content' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", void 0)
], DevicesController.prototype, "deleteDevice", null);
exports.DevicesController = DevicesController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('devices'),
    (0, common_1.UseGuards)(user_auth_guard_1.UserAuthGuard),
    (0, common_1.Controller)('devices'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof devices_service_1.DevicesService !== "undefined" && devices_service_1.DevicesService) === "function" ? _a : Object])
], DevicesController);


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DevicesService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const prisma_client_mygate_1 = __webpack_require__(10);
const mainflux_service_1 = __webpack_require__(23);
const auth_service_1 = __webpack_require__(9);
let DevicesService = exports.DevicesService = class DevicesService {
    constructor(prismaService, mainFluxService, authService) {
        this.prismaService = prismaService;
        this.mainFluxService = mainFluxService;
        this.authService = authService;
    }
    getDevices() {
        return this.prismaService.device.findMany({
            select: {
                id: true,
                deviceId: true,
                name: true,
                thingId: true,
                thingKey: true,
                channelId: true,
                lastSyncTimestamp: true,
                isMyGateDevice: true,
            },
        });
    }
    async getDevice(id) {
        const device = await this.prismaService.device.findFirst({
            where: {
                id: id,
            },
        });
        if (!device) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        return device;
    }
    async addDevice(device) {
        const uniqueDevice = await this.prismaService.device.findFirst({
            where: {
                deviceId: device.deviceId,
            },
        });
        if (uniqueDevice) {
            throw new common_1.HttpException('Device already exists', common_1.HttpStatus.BAD_REQUEST);
        }
        const thingResponse = await this.mainFluxService.createThing(device.deviceId);
        if (!(thingResponse && thingResponse.status == 201)) {
            throw new common_1.HttpException('Error creating thing', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const thingId = thingResponse.data.things[0].id;
        const thingKey = thingResponse.data.things[0].key;
        const channelResponse = await this.mainFluxService.createChannel(device.deviceId);
        if (!(channelResponse && channelResponse.status == 201)) {
            // delete thing if channel is not created
            await this.mainFluxService.deleteThing(thingId);
            throw new common_1.HttpException('Error creating channel', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const channelId = channelResponse.data.channels[0].id;
        const connectionResponse = await this.mainFluxService.connectThingChannel(thingId, channelId);
        if (!(connectionResponse && connectionResponse.status === 200)) {
            // delete thing and channel if connection fails
            await this.mainFluxService.deleteChannel(channelId);
            await this.mainFluxService.deleteThing(thingId);
            throw new common_1.HttpException('Error connecting thing and channel', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const deviceKey = await this.authService.hashPassword(device.deviceKey);
        const newDevice = await this.prismaService.device.create({
            data: {
                deviceId: device.deviceId,
                deviceKey: deviceKey,
                name: device.name,
                thingId: thingId,
                thingKey: thingKey,
                channelId: channelId,
                lastSyncTimestamp: 0,
                isMyGateDevice: device.isMyGateDevice,
            },
        });
        if (newDevice == undefined) {
            //delete thing and channel if device is not created
            await this.mainFluxService.deleteChannel(channelId);
            await this.mainFluxService.deleteThing(thingId);
            throw new common_1.HttpException('Error creating device', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            id: newDevice.id,
            deviceId: newDevice.deviceId,
            name: newDevice.name,
            thingId: newDevice.thingId,
            thingKey: newDevice.thingKey,
            channelId: newDevice.channelId,
            lastSyncTimestamp: newDevice.lastSyncTimestamp,
            isMyGateDevice: newDevice.isMyGateDevice,
        };
    }
    async editDevice(id, device) {
        const foundDevice = await this.prismaService.device.findFirst({
            where: {
                id: Number(id),
            },
        });
        if (!foundDevice) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        const updatedDevice = await this.prismaService.device.update({
            where: {
                id: id,
            },
            data: {
                name: device.name,
            },
        });
        return {
            id: updatedDevice.id,
            deviceId: updatedDevice.deviceId,
            name: updatedDevice.name,
            thingId: updatedDevice.thingId,
            thingKey: updatedDevice.thingKey,
            channelId: updatedDevice.channelId,
            lastSyncTimestamp: updatedDevice.lastSyncTimestamp,
            isMyGateDevice: updatedDevice.isMyGateDevice,
        };
    }
    async deleteDevice() {
        // TODO: implement this method
        // const device = await this.prismaService.device.findFirst({
        //   where: {
        //     id: id,
        //   },
        // });
        // if (!device) {
        //   throw new HttpException('Device not found', HttpStatus.NOT_FOUND);
        // }
        // const channelResponse = await this.mainFluxService.deleteChannel(
        //   device.channelId
        // );
        // if (channelResponse.status !== 204) {
        //   throw new HttpException(
        //     'Error deleting channel',
        //     HttpStatus.INTERNAL_SERVER_ERROR
        //   );
        // }
        // const thingResponse = await this.mainFluxService.deleteThing(
        //   device.thingId
        // );
        // if (thingResponse.status !== 204) {
        //   throw new HttpException(
        //     'Error deleting thing',
        //     HttpStatus.INTERNAL_SERVER_ERROR
        //   );
        // }
        // // TODO: fix this with id fk for devices
        // // TODO: do cascade delete
        // const uniqueTagIdlist = await this.prismaService.myGateCard.findMany({
        //   where: {
        //     deviceId: device.deviceId,
        //   },
        //   select: {
        //     id: true,
        //   },
        // });
        // uniqueTagIdlist.forEach(async (tagid) => {
        //   const deletedlogs = await this.prismaService.myGateLog.deleteMany({
        //     where: {
        //       myGateCardId: tagid.id,
        //     },
        //   });
        // });
        // const deltagresponse = await this.prismaService.myGateCard.deleteMany({
        //   where: {
        //     deviceId: device.deviceId,
        //   },
        // });
        // const syncToken = await this.prismaService.syncMessage.findFirst({
        //   where: {
        //     deviceId: device.id,
        //   },
        // });
        // if (syncToken) {
        //   const delSyncMessageCards =
        //     await this.prismaService.syncMessageCard.deleteMany({
        //       where: {
        //         sMId: syncToken.id,
        //       },
        //     });
        //   if (delSyncMessageCards) {
        //     const delSynctoken = await this.prismaService.syncMessage.delete({
        //       where: {
        //         id: syncToken.id,
        //       },
        //     });
        //   }
        // }
        // const deletedDeviceState = await this.prismaService.deviceCard.deleteMany({
        //   where: {
        //     deviceId: device.id,
        //   },
        // });
        // if (deltagresponse) {
        //   const deletedDevice = await this.prismaService.device.delete({
        //     where: {
        //       deviceId: device.deviceId,
        //     },
        //     select: {
        //       deviceId: true,
        //       name: true,
        //       thingId: true,
        //       thingKey: true,
        //       channelId: true,
        //       lastSyncTimestamp: true,
        //     },
        //   });
        //
        //   return;
        // } else
        //   throw new HttpException(
        //     {
        //       status: HttpStatus.BAD_REQUEST,
        //       error: 'Tag Not Exist',
        //     },
        //     HttpStatus.BAD_REQUEST
        //   );
    }
};
exports.DevicesService = DevicesService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof prisma_client_mygate_1.PrismaService !== "undefined" && prisma_client_mygate_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof mainflux_service_1.MainFluxService !== "undefined" && mainflux_service_1.MainFluxService) === "function" ? _b : Object, typeof (_c = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _c : Object])
], DevicesService);


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MainFluxService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const axios_1 = tslib_1.__importDefault(__webpack_require__(24));
const env_consts_1 = __webpack_require__(16);
const mqtt = tslib_1.__importStar(__webpack_require__(25));
let MainFluxService = exports.MainFluxService = class MainFluxService {
    constructor() {
        this.USER_TOKEN = '';
    }
    async connectAndPublishWithRetry(payload, thingId, thingKey, channelId, topicName) {
        const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
        console.log(thingKey, thingId, channelId, payload, clientId);
        const mqttOptions = {
            clientId,
            clean: true,
            connectTimeout: 4000,
            username: thingId,
            password: thingKey,
            reconnectPeriod: 1000,
            // additional options can be added here
        };
        const maxRetryAttempts = env_consts_1.MQTT_MAX_RETRY_COUNT;
        let retryCount = 0;
        while (retryCount < maxRetryAttempts) {
            try {
                // Connect to the MQTT broker
                const client = mqtt.connect(`mqtt://${env_consts_1.MQTT_DOMAIN_MYGATE}:${env_consts_1.MQTT_PORT_MYGATE}`, mqttOptions);
                // wrap the connection in a promise to handle connection errors
                await new Promise((resolve, reject) => {
                    client.on('connect', () => {
                        console.log('Connected to MQTT broker');
                        resolve(true); // Resolve with a boolean to indicate the success
                    });
                    client.on('error', (error) => {
                        console.error(`MQTT connection error: ${error}`);
                        client.end(); // Close the connection if an error occurs
                        reject(false); // Reject with a boolean to indicate the failure reason
                    });
                    client.on('close', () => {
                        console.log(`MQTT connection close`); // resolve(true);
                        client.end(); // Close the connection if an error occurs
                        reject(false);
                    });
                    client.on('end', () => {
                        console.log(`MQTT connection end`); // resolve(true);
                    });
                });
                // publish your message here
                const topic = `channels/${channelId}/messages/${topicName}`;
                const message = JSON.stringify(payload);
                client.publish(topic, message, (err) => {
                    if (err) {
                        console.error(`Error while publishing: ${err.message}`);
                        return false;
                    }
                    // close the connection after publishing
                    console.log('Published to MQTT', topic, payload);
                    client.end();
                });
                // exit the function after successful publish
                return true;
            }
            catch (error) {
                // Retry the connection after a delay
                retryCount++;
                console.log(`Retry attempt ${retryCount} failed: ${error.message}`);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the delay as needed // return { //status: false, //resp: error.message // }
            }
        }
        console.error('Failed to connect after multiple attempts.'); // return 'Failed to connect after multiple attempts.'
        return false;
    }
    async updateUserToken() {
        const userTokenResponse = await axios_1.default.post(`${env_consts_1.MQTT_HTTP_PROTOCOL_MYGATE}://${env_consts_1.MQTT_DOMAIN_MYGATE}/tokens`, {
            email: `${env_consts_1.MQTT_USERNAME}`,
            password: `${env_consts_1.MQTT_PASSWORD}`,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (userTokenResponse) {
            this.USER_TOKEN = userTokenResponse.data.token;
        }
    }
    async deleteThing(thingId) {
        return await this.deleteThingRequest(thingId).catch(async (e) => {
            // retry once with new user token
            await this.updateUserToken();
            return await this.deleteThingRequest(thingId);
        });
    }
    deleteThingRequest(thingId) {
        return axios_1.default.delete(`${env_consts_1.MQTT_HTTP_PROTOCOL_MYGATE}://${env_consts_1.MQTT_DOMAIN_MYGATE}/things/${thingId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.USER_TOKEN}`,
            },
        });
    }
    async deleteChannel(channelId) {
        return await this.deleteChannelRequest(channelId).catch(async (e) => {
            // retry once with new user token
            await this.updateUserToken();
            return await this.deleteChannelRequest(channelId);
        });
    }
    deleteChannelRequest(channelId) {
        return axios_1.default.delete(`${env_consts_1.MQTT_HTTP_PROTOCOL_MYGATE}://${env_consts_1.MQTT_DOMAIN_MYGATE}/channels/${channelId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.USER_TOKEN}`,
            },
        });
    }
    async createThing(deviceId) {
        return await this.createThingRequest(deviceId).catch(async (e) => {
            // retry once with new user token
            await this.updateUserToken();
            return await this.createThingRequest(deviceId);
        });
    }
    createThingRequest(deviceId) {
        const data = [{ name: deviceId }];
        return axios_1.default.post(`${env_consts_1.MQTT_HTTP_PROTOCOL_MYGATE}://${env_consts_1.MQTT_DOMAIN_MYGATE}/things`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.USER_TOKEN}`,
            },
        });
    }
    async createChannel(deviceId) {
        return await this.createChannelRequest(deviceId).catch(async (e) => {
            // retry once with new user token
            await this.updateUserToken();
            return await this.createChannelRequest(deviceId);
        });
    }
    createChannelRequest(deviceId) {
        const data = [{ name: deviceId }];
        return axios_1.default.post(`${env_consts_1.MQTT_HTTP_PROTOCOL_MYGATE}://${env_consts_1.MQTT_DOMAIN_MYGATE}/channels`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.USER_TOKEN}`,
            },
        });
    }
    async connectThingChannel(thingId, channelId) {
        return await this.connectThingChannelRequest(thingId, channelId).catch(async (e) => {
            // retry once with new user token
            await this.updateUserToken();
            return await this.connectThingChannelRequest(thingId, channelId);
        });
    }
    connectThingChannelRequest(thingId, channelId) {
        return axios_1.default.put(`${env_consts_1.MQTT_HTTP_PROTOCOL_MYGATE}://${env_consts_1.MQTT_DOMAIN_MYGATE}/channels/${channelId}/things/${thingId}`, null, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.USER_TOKEN}`,
            },
        });
    }
    async publishNotifyToMqtt(accessNotifyDto, deviceId, thingId, thingKey, channelId) {
        // build senml for notification
        const body = [
            {
                bn: '',
                bt: accessNotifyDto.ts,
                bu: '',
                bver: 5,
                n: 'deviceId',
                vs: deviceId,
            },
            {
                n: 'cardId',
                vs: accessNotifyDto.ci,
            },
            {
                n: 'status',
                vs: accessNotifyDto.st,
            },
            {
                n: 'direction',
                vs: accessNotifyDto.dr,
            },
        ];
        return this.connectAndPublishWithRetry(body, thingId, thingKey, channelId, 'mygate-notify');
    }
};
exports.MainFluxService = MainFluxService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], MainFluxService);


/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = require("axios");

/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("mqtt");

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.returnDevicePostDto = exports.EditDeviceDto = exports.AddDeviceDto = exports.DeviceDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
class DeviceDto {
}
exports.DeviceDto = DeviceDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], DeviceDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceDto.prototype, "deviceId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceDto.prototype, "name", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceDto.prototype, "thingId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceDto.prototype, "thingKey", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceDto.prototype, "channelId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], DeviceDto.prototype, "lastSyncTimestamp", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Boolean)
], DeviceDto.prototype, "isMyGateDevice", void 0);
class AddDeviceDto extends (0, swagger_1.PickType)(DeviceDto, [
    'deviceId',
    'name',
    'isMyGateDevice',
]) {
}
exports.AddDeviceDto = AddDeviceDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AddDeviceDto.prototype, "deviceKey", void 0);
class EditDeviceDto extends (0, swagger_1.PickType)(DeviceDto, ['id', 'name']) {
}
exports.EditDeviceDto = EditDeviceDto;
class returnDevicePostDto {
}
exports.returnDevicePostDto = returnDevicePostDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], returnDevicePostDto.prototype, "thingId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], returnDevicePostDto.prototype, "thingKey", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], returnDevicePostDto.prototype, "channelId", void 0);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserAuthGuard = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(9);
let UserAuthGuard = exports.UserAuthGuard = class UserAuthGuard {
    constructor(authService) {
        this.authService = authService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        // const data = context.switchToHttp().getRequest();
        // const user = request.user
        return this.authService.validateBearerToken(request);
    }
};
exports.UserAuthGuard = UserAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], UserAuthGuard);


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MainFluxModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const mainflux_service_1 = __webpack_require__(23);
let MainFluxModule = exports.MainFluxModule = class MainFluxModule {
};
exports.MainFluxModule = MainFluxModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [mainflux_service_1.MainFluxService],
    })
], MainFluxModule);


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(9);
const config_1 = __webpack_require__(14);
const prisma_client_mygate_1 = __webpack_require__(10);
const auth_guard_1 = __webpack_require__(8);
const jwt_1 = __webpack_require__(17);
let AuthModule = exports.AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_client_mygate_1.PrismaClientMygateModule, jwt_1.JwtModule.register({})],
        providers: [auth_service_1.AuthService, config_1.ConfigService, jwt_1.JwtService, auth_guard_1.AuthGuard],
        exports: [],
    })
], AuthModule);


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateCardsModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const mygate_cards_controller_1 = __webpack_require__(31);
const mygate_cards_service_1 = __webpack_require__(32);
const prisma_client_mygate_1 = __webpack_require__(10);
const mygate_module_1 = __webpack_require__(34);
const auth_module_1 = __webpack_require__(29);
const auth_service_1 = __webpack_require__(9);
const config_1 = __webpack_require__(14);
const jwt_1 = __webpack_require__(17);
let MyGateCardsModule = exports.MyGateCardsModule = class MyGateCardsModule {
};
exports.MyGateCardsModule = MyGateCardsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_client_mygate_1.PrismaClientMygateModule, mygate_module_1.MyGateModule, auth_module_1.AuthModule],
        controllers: [mygate_cards_controller_1.MyGateCardsController],
        providers: [mygate_cards_service_1.MyGateCardsService, auth_service_1.AuthService, jwt_1.JwtService, config_1.ConfigService],
    })
], MyGateCardsModule);


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateCardsController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const mygate_cards_service_1 = __webpack_require__(32);
const swagger_1 = __webpack_require__(4);
const user_auth_guard_1 = __webpack_require__(27);
const mygate_card_dto_1 = __webpack_require__(33);
let MyGateCardsController = exports.MyGateCardsController = class MyGateCardsController {
    constructor(myGateCardsService) {
        this.myGateCardsService = myGateCardsService;
    }
    getMyGateCards(deviceId) {
        return this.myGateCardsService.getMyGateCards(deviceId);
    }
    getMyGateCard(id) {
        return this.myGateCardsService.getMyGateCard(+id);
    }
    addTag(addMyGateCardDto) {
        return this.myGateCardsService.addMyGateCard(addMyGateCardDto);
    }
    editTag(id, editMyGateCardDto) {
        return this.myGateCardsService.editMyGateCard(+id, editMyGateCardDto);
    }
    deleteMyGateCard(id) {
        return this.myGateCardsService.deleteMyGateCard(+id);
    }
};
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all cards' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: [mygate_card_dto_1.GetMyGateCardDto] }),
    (0, swagger_1.ApiParam)({ name: 'deviceId', type: 'string', description: 'Example ID: Fountlab_tag_01' }),
    (0, common_1.Get)(':deviceId'),
    tslib_1.__param(0, (0, common_1.Param)('deviceId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], MyGateCardsController.prototype, "getMyGateCards", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get Card by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number', description: 'Example ID: 1' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: mygate_card_dto_1.MyGateCardDto }),
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], MyGateCardsController.prototype, "getMyGateCard", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Add Card' }),
    (0, swagger_1.ApiBody)({ type: mygate_card_dto_1.AddMyGateCardDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Success', type: mygate_card_dto_1.MyGateCardDto }),
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof mygate_card_dto_1.AddMyGateCardDto !== "undefined" && mygate_card_dto_1.AddMyGateCardDto) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], MyGateCardsController.prototype, "addTag", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update Card Information' }),
    (0, swagger_1.ApiBody)({ type: mygate_card_dto_1.EditMyGateCardDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Success', type: mygate_card_dto_1.MyGateCardDto }),
    (0, common_1.Put)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, typeof (_e = typeof mygate_card_dto_1.EditMyGateCardDto !== "undefined" && mygate_card_dto_1.EditMyGateCardDto) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], MyGateCardsController.prototype, "editTag", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete Card Information' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number', description: 'Example ID: 1' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Success', type: mygate_card_dto_1.MyGateCardDto }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], MyGateCardsController.prototype, "deleteMyGateCard", null);
exports.MyGateCardsController = MyGateCardsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('mygate-cards'),
    (0, common_1.UseGuards)(user_auth_guard_1.UserAuthGuard),
    (0, common_1.Controller)('mygate-cards'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mygate_cards_service_1.MyGateCardsService !== "undefined" && mygate_cards_service_1.MyGateCardsService) === "function" ? _a : Object])
], MyGateCardsController);


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateCardsService = void 0;
const tslib_1 = __webpack_require__(6);
const prisma_client_mygate_1 = __webpack_require__(10);
const common_1 = __webpack_require__(1);
let MyGateCardsService = exports.MyGateCardsService = class MyGateCardsService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async getMyGateCards(deviceId) {
        // check for device and get device cards and mygate cards from the device
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: deviceId
            },
            include: {
                myGateCards: true,
                deviceCards: true
            }
        });
        if (!device)
            throw new common_1.HttpException("device not found", common_1.HttpStatus.NOT_FOUND);
        // first take mygatecards and devicecards out from the object.
        const mygateCards = device.myGateCards;
        const deviceCards = device.deviceCards;
        // Iterate over each item in mygateCards
        const mygateCardsWithPresence = mygateCards.map(mygateCard => {
            // Check if the accessDisplay of the current mygateCard exists in deviceCards
            const isPresent = deviceCards.some(deviceCard => deviceCard.cardId === mygateCard.accessDisplay);
            // Return the mygateCard with the isPresent field added
            return {
                ...mygateCard,
                isPresent
            };
        });
        return mygateCardsWithPresence;
    }
    async getMyGateCard(id) {
        const myGateCard = await this.prismaService.myGateCard.findFirst({
            where: {
                id: id,
            },
            include: {
                device: true,
            },
        });
        if (!myGateCard) {
            throw new common_1.HttpException('MyGate card not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { ...myGateCard, deviceId: myGateCard.device.deviceId };
    }
    async addMyGateCard(addMyGateCardDto) {
        console.log(addMyGateCardDto);
        const existingTag = await this.prismaService.myGateCard.findFirst({
            where: {
                OR: [
                    {
                        accessRefId: addMyGateCardDto.accessRefId,
                    },
                    { accessDisplay: addMyGateCardDto.accessDisplay },
                ],
            },
        });
        if (existingTag) {
            throw new common_1.HttpException('MyGate card already exists', common_1.HttpStatus.BAD_REQUEST);
        }
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: addMyGateCardDto.deviceId,
            },
        });
        if (!device) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.prismaService.myGateCard.create({
            data: {
                accessDisplay: String(addMyGateCardDto.accessDisplay),
                accessEntityType: String(addMyGateCardDto.accessEntityType),
                accessRefId: String(addMyGateCardDto.accessRefId),
                accessUuid: String(addMyGateCardDto.accessUuidType),
                accessUuidType: String(addMyGateCardDto.accessUuidType),
                deviceId: device.id,
            },
        });
    }
    async editMyGateCard(id, editMyGateCardDto) {
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: editMyGateCardDto.deviceId,
            },
        });
        if (!device) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        const edited = await this.prismaService.myGateCard.update({
            where: {
                id: id,
            },
            data: { ...editMyGateCardDto, deviceId: device.id },
        });
        return { ...edited, deviceId: device.deviceId };
    }
    async deleteMyGateCard(id) {
        const myGateCard = await this.prismaService.myGateCard.findFirst({
            where: {
                id: id,
            },
            include: {
                device: true,
            },
        });
        if (!myGateCard) {
            throw new common_1.HttpException('MyGate card not found', common_1.HttpStatus.NOT_FOUND);
        }
        const deleted = await this.prismaService.myGateCard.delete({
            where: {
                id: id,
            },
        });
        return { ...deleted, deviceId: myGateCard.device.deviceId };
    }
};
exports.MyGateCardsService = MyGateCardsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof prisma_client_mygate_1.PrismaService !== "undefined" && prisma_client_mygate_1.PrismaService) === "function" ? _a : Object])
], MyGateCardsService);


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EditMyGateCardDto = exports.AddMyGateCardDto = exports.GetMyGateCardDto = exports.MyGateCardDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
class MyGateCardDto {
}
exports.MyGateCardDto = MyGateCardDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], MyGateCardDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], MyGateCardDto.prototype, "accessEntityType", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], MyGateCardDto.prototype, "accessUuidType", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], MyGateCardDto.prototype, "accessRefId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], MyGateCardDto.prototype, "accessUuid", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], MyGateCardDto.prototype, "accessDisplay", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], MyGateCardDto.prototype, "deviceId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Boolean)
], MyGateCardDto.prototype, "isPresent", void 0);
class GetMyGateCardDto {
}
exports.GetMyGateCardDto = GetMyGateCardDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], GetMyGateCardDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], GetMyGateCardDto.prototype, "accessEntityType", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], GetMyGateCardDto.prototype, "accessUuidType", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], GetMyGateCardDto.prototype, "accessRefId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], GetMyGateCardDto.prototype, "accessUuid", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], GetMyGateCardDto.prototype, "accessDisplay", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], GetMyGateCardDto.prototype, "deviceId", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Boolean)
], GetMyGateCardDto.prototype, "isPresent", void 0);
class AddMyGateCardDto extends (0, swagger_1.OmitType)(MyGateCardDto, ['id']) {
}
exports.AddMyGateCardDto = AddMyGateCardDto;
class EditMyGateCardDto extends (0, swagger_1.OmitType)(MyGateCardDto, ['id']) {
}
exports.EditMyGateCardDto = EditMyGateCardDto;


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const mygate_service_1 = __webpack_require__(35);
const prisma_client_mygate_1 = __webpack_require__(10);
const mygate_controller_1 = __webpack_require__(37);
const mainflux_module_1 = __webpack_require__(28);
const mainflux_service_1 = __webpack_require__(23);
const auth_module_1 = __webpack_require__(29);
const config_1 = __webpack_require__(14);
const auth_service_1 = __webpack_require__(9);
const jwt_1 = __webpack_require__(17);
let MyGateModule = exports.MyGateModule = class MyGateModule {
};
exports.MyGateModule = MyGateModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_client_mygate_1.PrismaClientMygateModule, mainflux_module_1.MainFluxModule, auth_module_1.AuthModule],
        providers: [mygate_service_1.MyGateService, mainflux_service_1.MainFluxService, jwt_1.JwtService, auth_service_1.AuthService, config_1.ConfigService],
        controllers: [mygate_controller_1.MyGateController],
    })
], MyGateModule);


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const prisma_client_mygate_1 = __webpack_require__(10);
const axios_1 = tslib_1.__importDefault(__webpack_require__(24));
const schedule_1 = __webpack_require__(36);
const env_consts_1 = __webpack_require__(16);
const mainflux_service_1 = __webpack_require__(23);
let MyGateService = exports.MyGateService = class MyGateService {
    constructor(prismaService, mainFluxService) {
        this.prismaService = prismaService;
        this.mainFluxService = mainFluxService;
    }
    async mygateCardState(deviceId, access_display) {
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: deviceId
            }
        });
        if (!device)
            throw new common_1.HttpException('device not found', common_1.HttpStatus.NOT_FOUND);
        const mygate_card = await this.prismaService.myGateCard.findFirst({
            where: {
                accessDisplay: access_display,
                deviceId: device.id
            },
            select: {
                accessDisplay: true
            }
        });
        const device_card = await this.prismaService.deviceCard.findFirst({
            where: {
                cardId: access_display,
                deviceId: device.id
            },
            select: {
                cardId: true
            }
        });
        return {
            server: mygate_card,
            device: device_card
        };
    }
    async myGateNotify(myGateNotifyDto) {
        return axios_1.default.post(`${env_consts_1.MYGATE_API_URL}/access/v1/notify`, myGateNotifyDto, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'mg-xs-api-key': `${env_consts_1.MYGATE_API_KEY}`,
            },
        });
    }
    async myGateSync() {
        try {
            const devices = await this.prismaService.device.findMany({
                where: { isMyGateDevice: true },
                select: { id: true },
            });
            const deviceIds = devices.map((d) => d.id);
            // TODO: implement workers
            const promises = [];
            for (const id of deviceIds) {
                promises.push(this.myGateSyncForDeviceWithId(id));
            }
            await Promise.all(promises);
        }
        catch (e) {
            common_1.Logger.log('myGateSync', e);
        }
    }
    async myGateSyncForDeviceWithDeviceId(deviceId) {
        const device = await this.prismaService.device.findFirst({
            where: { deviceId: deviceId },
        });
        if (!device) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.myGateSyncForDevice(device);
    }
    async myGateSyncForDeviceWithId(id) {
        const device = await this.prismaService.device.findFirst({
            where: { id: id },
        });
        if (!device) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.myGateSyncForDevice(device);
    }
    async myGateSyncForDevice(device) {
        const { id, deviceId, lastSyncTimestamp } = device;
        let page = 0;
        let isAll = false;
        const accessRefIdsInAll = [];
        const flag = true;
        while (flag) {
            const myGateSyncResponse = await this.fetchSyncDataFromMyGate(deviceId, lastSyncTimestamp, page);
            if (myGateSyncResponse.all) {
                isAll = true;
                for (const myGateSyncCard of myGateSyncResponse.all) {
                    accessRefIdsInAll.push(myGateSyncCard.access_ref_id);
                    await this.prismaService.myGateCard.upsert({
                        create: {
                            accessRefId: myGateSyncCard.access_ref_id,
                            accessUuid: myGateSyncCard.access_uuid,
                            accessUuidType: myGateSyncCard.access_uuid_type,
                            accessEntityType: myGateSyncCard.access_entity_type,
                            accessDisplay: myGateSyncCard.access_display,
                            deviceId: id,
                        },
                        update: {
                            accessUuid: myGateSyncCard.access_uuid,
                            accessUuidType: myGateSyncCard.access_uuid_type,
                            accessEntityType: myGateSyncCard.access_entity_type,
                            accessDisplay: myGateSyncCard.access_display,
                        },
                        where: {
                            deviceId_accessRefId: {
                                deviceId: id,
                                accessRefId: myGateSyncCard.access_ref_id,
                            },
                        },
                    });
                }
            }
            if (myGateSyncResponse.upserted) {
                for (const myGateSyncCard of myGateSyncResponse.upserted) {
                    await this.prismaService.myGateCard.upsert({
                        create: {
                            accessRefId: myGateSyncCard.access_ref_id,
                            accessUuid: myGateSyncCard.access_uuid,
                            accessUuidType: myGateSyncCard.access_uuid_type,
                            accessEntityType: myGateSyncCard.access_entity_type,
                            accessDisplay: myGateSyncCard.access_display,
                            deviceId: id,
                        },
                        update: {
                            accessUuid: myGateSyncCard.access_uuid,
                            accessUuidType: myGateSyncCard.access_uuid_type,
                            accessEntityType: myGateSyncCard.access_entity_type,
                            accessDisplay: myGateSyncCard.access_display,
                        },
                        where: {
                            deviceId_accessRefId: {
                                deviceId: id,
                                accessRefId: myGateSyncCard.access_ref_id,
                            },
                        },
                    });
                }
            }
            if (myGateSyncResponse.deleted) {
                await this.prismaService.myGateCard.deleteMany({
                    where: { accessRefId: { in: myGateSyncResponse.deleted } },
                });
            }
            if (!myGateSyncResponse._links) {
                break;
            }
            page++;
        }
        if (isAll) {
            await this.prismaService.myGateCard.deleteMany({
                where: {
                    deviceId: id,
                    accessRefId: {
                        notIn: accessRefIdsInAll,
                    },
                },
            });
        }
        console.log('Fetched MyGate cards for device', deviceId);
    }
    async fetchSyncDataFromMyGate(deviceId, lastSyncTimestamp, page = 0) {
        const url = `${env_consts_1.MYGATE_API_URL}/access/v1/sync?device_id=${deviceId}&timestamp=${lastSyncTimestamp}&page=${page}`;
        const r = await axios_1.default.get(url, {
            headers: {
                'Content-Type': 'application/json',
                'mg-xs-etype': 'VEHICLE',
                'mg-xs-api-key': `${env_consts_1.MYGATE_API_KEY}`,
            },
        });
        return r.data;
    }
    async deviceSyncMyGate() {
        try {
            const devices = await this.prismaService.device.findMany({
                where: { isMyGateDevice: true },
                select: { id: true },
            });
            const deviceIds = devices.map((d) => d.id);
            // TODO: implement workers
            const promises = [];
            for (const deviceId of deviceIds) {
                const promise = this.deviceSyncMyGateForDevice(deviceId);
                promises.push(promise);
            }
            await Promise.all(promises);
        }
        catch (e) {
            common_1.Logger.log('deviceSync', e);
        }
    }
    async deviceSyncMyGateForDevice(id) {
        await this.prismaService
            .$transaction(async (tx) => {
            const device = await tx.device.findFirst({
                where: { id: id },
                include: {
                    deviceCards: true,
                    myGateCards: true,
                },
            });
            const { deviceCards, myGateCards } = device;
            const deviceCardsCardIds = deviceCards.map((c) => c.cardId);
            const myGateCardsAccessDisplays = myGateCards.map((c) => c.accessDisplay);
            const toAdd = myGateCardsAccessDisplays.filter((c) => !deviceCardsCardIds.includes(c));
            const toDelete = deviceCardsCardIds.filter((c) => !myGateCardsAccessDisplays.includes(c));
            if (toAdd.length === 0 && toDelete.length === 0) {
                return;
            }
            const toAddBatch = toAdd.length > env_consts_1.DEVICE_SYNC_BATCH_SIZE
                ? toAdd.slice(0, env_consts_1.DEVICE_SYNC_BATCH_SIZE)
                : toAdd;
            const toDeleteBatch = toDelete.length > env_consts_1.DEVICE_SYNC_BATCH_SIZE
                ? toDelete.slice(0, env_consts_1.DEVICE_SYNC_BATCH_SIZE)
                : toDelete;
            const syncToken = await this.sendDeviceSyncMessage(device, toAddBatch, toDeleteBatch);
            const syncMessageCards = toAddBatch
                .map((c) => {
                return { cardId: c, status: 'ADD' };
            })
                .concat(toDeleteBatch.map((c) => {
                return { cardId: c, status: 'REMOVE' };
            }));
            await tx.syncMessage.create({
                data: {
                    deviceId: id,
                    syncToken: syncToken,
                    cards: {
                        create: syncMessageCards,
                    },
                },
            });
            console.log('Add sync message for device', device.deviceId, syncToken, syncMessageCards);
        })
            .catch((e) => {
            common_1.Logger.log('deviceSyncMyGateForDevice', e);
        });
    }
    async sendDeviceSyncMessage(device, toAdd, toDelete) {
        const syncToken = new Date().getTime();
        const accessSyncDto = {
            st: String(syncToken),
            na: toAdd.length,
            a: toAdd,
            nr: toDelete.length,
            r: toDelete,
            t: 'HTTP',
            l: `${env_consts_1.API_URL}/sync-ack/${device.deviceId}`,
        };
        await this.mainFluxService.connectAndPublishWithRetry(accessSyncDto, device.thingId, device.thingKey, device.channelId, 'mygate-sync');
        console.log('Sent sync message to device', device.deviceId, accessSyncDto);
        return String(syncToken);
    }
};
tslib_1.__decorate([
    (0, schedule_1.Cron)(env_consts_1.MYGATE_SYNC_CRON, {
        name: 'myGateSync',
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MyGateService.prototype, "myGateSync", null);
tslib_1.__decorate([
    (0, schedule_1.Cron)(env_consts_1.DEVICE_SYNC_CRON, {
        name: 'deviceSyncMyGate',
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MyGateService.prototype, "deviceSyncMyGate", null);
exports.MyGateService = MyGateService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof prisma_client_mygate_1.PrismaService !== "undefined" && prisma_client_mygate_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof mainflux_service_1.MainFluxService !== "undefined" && mainflux_service_1.MainFluxService) === "function" ? _b : Object])
], MyGateService);


/***/ }),
/* 36 */
/***/ ((module) => {

module.exports = require("@nestjs/schedule");

/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const mygate_service_1 = __webpack_require__(35);
const user_auth_guard_1 = __webpack_require__(27);
const env_consts_1 = __webpack_require__(16);
let MyGateController = exports.MyGateController = class MyGateController {
    constructor(myGateService) {
        this.myGateService = myGateService;
    }
    // test api for tag sync check
    async myGateFrontend() {
        return { API_URL: env_consts_1.API_URL };
    }
    myGateSync() {
        return this.myGateService.myGateSync();
    }
    myGateSyncForDeviceWithDeviceId(deviceId) {
        return this.myGateService.myGateSyncForDeviceWithDeviceId(deviceId);
    }
    mygateCardState(deviceId, access_display) {
        return this.myGateService.mygateCardState(deviceId, access_display);
    }
};
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'mygate fontend application page route',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
    }),
    (0, common_1.Render)('index'),
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MyGateController.prototype, "myGateFrontend", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(user_auth_guard_1.UserAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Sync updates from MyGate and update the device state',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
    }),
    (0, common_1.Post)('sync'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], MyGateController.prototype, "myGateSync", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(user_auth_guard_1.UserAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Sync updates from MyGate and update the device state',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
    }),
    (0, common_1.Post)('sync/:deviceId'),
    tslib_1.__param(0, (0, common_1.Param)('deviceId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], MyGateController.prototype, "myGateSyncForDeviceWithDeviceId", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(user_auth_guard_1.UserAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Mygate Card state',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
    }),
    (0, common_1.Get)('card/:deviceId/:access_display'),
    tslib_1.__param(0, (0, common_1.Param)('deviceId')),
    tslib_1.__param(1, (0, common_1.Param)('access_display')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", void 0)
], MyGateController.prototype, "mygateCardState", null);
exports.MyGateController = MyGateController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('mygate'),
    (0, common_1.Controller)('mygate'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mygate_service_1.MyGateService !== "undefined" && mygate_service_1.MyGateService) === "function" ? _a : Object])
], MyGateController);


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateLogsModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const mygate_logs_controller_1 = __webpack_require__(39);
const mygate_logs_service_1 = __webpack_require__(40);
const prisma_client_mygate_1 = __webpack_require__(10);
const mygate_module_1 = __webpack_require__(34);
const mygate_service_1 = __webpack_require__(35);
const mainflux_module_1 = __webpack_require__(28);
const mainflux_service_1 = __webpack_require__(23);
const auth_module_1 = __webpack_require__(29);
const config_1 = __webpack_require__(14);
const auth_service_1 = __webpack_require__(9);
const jwt_1 = __webpack_require__(17);
let MyGateLogsModule = exports.MyGateLogsModule = class MyGateLogsModule {
};
exports.MyGateLogsModule = MyGateLogsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_client_mygate_1.PrismaClientMygateModule, mygate_module_1.MyGateModule, mainflux_module_1.MainFluxModule, auth_module_1.AuthModule],
        controllers: [mygate_logs_controller_1.MyGateLogsController],
        providers: [
            mygate_logs_service_1.MyGateLogsService,
            jwt_1.JwtService,
            mygate_service_1.MyGateService,
            mainflux_service_1.MainFluxService,
            auth_service_1.AuthService,
            config_1.ConfigService,
        ],
    })
], MyGateLogsModule);


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateLogsController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const mygate_logs_service_1 = __webpack_require__(40);
const swagger_1 = __webpack_require__(4);
const user_auth_guard_1 = __webpack_require__(27);
const mygate_log_dto_1 = __webpack_require__(41);
let MyGateLogsController = exports.MyGateLogsController = class MyGateLogsController {
    constructor(myGateLogsService) {
        this.myGateLogsService = myGateLogsService;
    }
    async exportDeviceLogInExcel(deviceId, fromDate, toDate) {
        const data = await this.myGateLogsService.getDataForDeviceLogInExcel(deviceId, +fromDate, +toDate);
        return data;
    }
    // TODO: add filters by device, by card, by time, by notification
    getMyGateLogs(myGateCardId) {
        return this.myGateLogsService.getMyGateLogs(myGateCardId === undefined ? undefined : +myGateCardId);
    }
    getMyGateLog(id) {
        return this.myGateLogsService.getMyGateLog(+id);
    }
    deleteMyGateLog(id) {
        return this.myGateLogsService.deleteMyGateLog(+id);
    }
};
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: "export residents data by society" }),
    (0, swagger_1.ApiQuery)({ name: 'deviceId', description: 'Device ID', type: String, required: true }),
    (0, swagger_1.ApiQuery)({ name: 'from', description: 'from timestamp', type: Number, required: true }),
    (0, swagger_1.ApiQuery)({ name: 'to', description: 'to timestamp', type: Number, required: true }),
    (0, common_1.Get)('report'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    tslib_1.__param(0, (0, common_1.Query)('deviceId')),
    tslib_1.__param(1, (0, common_1.Query)('from')),
    tslib_1.__param(2, (0, common_1.Query)('to')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Number, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], MyGateLogsController.prototype, "exportDeviceLogInExcel", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all logs' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: [mygate_log_dto_1.MyGateLogDto] }),
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Query)('myGateCardId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], MyGateLogsController.prototype, "getMyGateLogs", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], MyGateLogsController.prototype, "getMyGateLog", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete the log' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'number', description: 'Example ID: 1' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Success', type: mygate_log_dto_1.MyGateLogDto }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], MyGateLogsController.prototype, "deleteMyGateLog", null);
exports.MyGateLogsController = MyGateLogsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('mygate-logs'),
    (0, common_1.UseGuards)(user_auth_guard_1.UserAuthGuard),
    (0, common_1.Controller)('mygate-logs'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof mygate_logs_service_1.MyGateLogsService !== "undefined" && mygate_logs_service_1.MyGateLogsService) === "function" ? _a : Object])
], MyGateLogsController);


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateLogsService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const prisma_client_mygate_1 = __webpack_require__(10);
let MyGateLogsService = exports.MyGateLogsService = class MyGateLogsService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async getDataForDeviceLogInExcel(deviceId, fromTimestamp, toTimestamp) {
        console.log(deviceId, fromTimestamp, toTimestamp);
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: deviceId
            }
        });
        if (!device)
            throw new common_1.HttpException('device not found', common_1.HttpStatus.NOT_FOUND);
        console.log(device.id, fromTimestamp, toTimestamp);
        const response = await this.prismaService.$queryRaw `
    SELECT b.access_display, b.access_ref_id, a.timestamp, a.status, a.direction, a.mygate_response
    FROM mygate_logs AS a
    INNER JOIN mygate_cards AS b ON a.mygate_card_id = b.id
    WHERE a.mygate_card_id IN (SELECT id FROM mygate_cards WHERE device_id = ${device.id})
    AND a.created_at >= TO_TIMESTAMP(${fromTimestamp}) AND a.created_at <= TO_TIMESTAMP(${toTimestamp});
    `;
        console.log(response);
        return response;
    }
    async getMyGateLogs(myGateCardId) {
        return this.prismaService.myGateLog.findMany({
            select: {
                id: true,
                timestamp: true,
                status: true,
                direction: true,
                myGateCardId: true,
            },
            where: {
                myGateCardId: myGateCardId,
            },
        });
    }
    async getMyGateLog(id) {
        const log = await this.prismaService.myGateLog.findFirst({
            where: {
                id: Number(id),
            },
        });
        if (!log) {
            throw new common_1.HttpException('MyGate log not found', common_1.HttpStatus.NOT_FOUND);
        }
        return log;
    }
    deleteMyGateLog(id) {
        return this.prismaService.myGateLog.delete({
            where: {
                id: id,
            },
        });
    }
};
exports.MyGateLogsService = MyGateLogsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof prisma_client_mygate_1.PrismaService !== "undefined" && prisma_client_mygate_1.PrismaService) === "function" ? _a : Object])
], MyGateLogsService);


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyGateLogDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
class MyGateLogDto {
}
exports.MyGateLogDto = MyGateLogDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], MyGateLogDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], MyGateLogDto.prototype, "timestamp", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], MyGateLogDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], MyGateLogDto.prototype, "direction", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], MyGateLogDto.prototype, "myGateCardId", void 0);


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const communication_controller_1 = __webpack_require__(43);
const communication_service_1 = __webpack_require__(44);
const prisma_client_mygate_1 = __webpack_require__(10);
const mainflux_service_1 = __webpack_require__(23);
const mygate_service_1 = __webpack_require__(35);
const auth_service_1 = __webpack_require__(9);
const config_1 = __webpack_require__(14);
const jwt_1 = __webpack_require__(17);
let CommunicationModule = exports.CommunicationModule = class CommunicationModule {
};
exports.CommunicationModule = CommunicationModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [prisma_client_mygate_1.PrismaClientMygateModule],
        controllers: [communication_controller_1.CommunicationController],
        providers: [
            communication_service_1.CommunicationService,
            mainflux_service_1.MainFluxService,
            mygate_service_1.MyGateService,
            auth_service_1.AuthService,
            config_1.ConfigService,
            jwt_1.JwtService,
        ],
    })
], CommunicationModule);


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const communication_service_1 = __webpack_require__(44);
const access_notify_dto_1 = __webpack_require__(45);
const swagger_1 = __webpack_require__(4);
const auth_guard_1 = __webpack_require__(8);
const communication_dto_1 = __webpack_require__(46);
const access_sync_dto_1 = __webpack_require__(47);
const access_sync_ack_dto_1 = __webpack_require__(48);
let CommunicationController = exports.CommunicationController = class CommunicationController {
    constructor(communicationService) {
        this.communicationService = communicationService;
    }
    accessNotify(deviceId, accessNotifyDto) {
        return this.communicationService.accessNotify(deviceId, accessNotifyDto);
    }
    getCredentials(deviceId) {
        return this.communicationService.getCredentials(deviceId);
    }
    getTime() {
        return this.communicationService.getTime();
    }
    iAmHere(deviceId) {
        return this.communicationService.iAmHere(deviceId);
    }
    accessSync(deviceId, accessSyncDto) {
        return this.communicationService.accessSync(deviceId, accessSyncDto);
    }
    accessSyncAck(deviceId, accessSyncAckDto) {
        return this.communicationService.accessSyncAck(deviceId, accessSyncAckDto);
    }
};
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Notify the server with device log' }),
    (0, swagger_1.ApiParam)({
        name: 'deviceId',
        type: 'string',
        description: 'Example ID: fountlab_tag_01',
    }),
    (0, swagger_1.ApiBody)({ type: access_notify_dto_1.AccessNotifyDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Success' }),
    (0, common_1.Post)('notify/:deviceId'),
    tslib_1.__param(0, (0, common_1.Param)('deviceId')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_b = typeof access_notify_dto_1.AccessNotifyDto !== "undefined" && access_notify_dto_1.AccessNotifyDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CommunicationController.prototype, "accessNotify", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get credentials for the device' }),
    (0, swagger_1.ApiParam)({
        name: 'deviceId',
        type: 'string',
        description: 'Example ID: fountlab_tag_01',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
        type: communication_dto_1.DeviceCredentialsResponseForDeviceDto,
    }),
    (0, common_1.Get)('credentials/:deviceId'),
    tslib_1.__param(0, (0, common_1.Param)('deviceId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], CommunicationController.prototype, "getCredentials", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get current time on the server' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
        type: communication_dto_1.DateTimeForDeviceDto,
    }),
    (0, common_1.Get)('time'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], CommunicationController.prototype, "getTime", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Api for device liveness' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success', type: Number }),
    (0, common_1.Get)('i-am-here/:deviceId') // seconds in epoc
    ,
    tslib_1.__param(0, (0, common_1.Param)('deviceId')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], CommunicationController.prototype, "iAmHere", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Publish the message on channel with mqtt' }),
    (0, swagger_1.ApiParam)({
        name: 'deviceId',
        type: 'string',
        description: 'Example ID: Aa23hk23',
    }),
    (0, swagger_1.ApiBody)({ type: access_sync_dto_1.AccessSyncDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Success' }),
    (0, common_1.Post)('access-sync/:deviceId'),
    tslib_1.__param(0, (0, common_1.Param)('deviceId')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_f = typeof access_sync_dto_1.AccessSyncDto !== "undefined" && access_sync_dto_1.AccessSyncDto) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CommunicationController.prototype, "accessSync", null);
tslib_1.__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Post)('sync-ack/:deviceId'),
    tslib_1.__param(0, (0, common_1.Param)('deviceId')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_g = typeof access_sync_ack_dto_1.AccessSyncAckDto !== "undefined" && access_sync_ack_dto_1.AccessSyncAckDto) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CommunicationController.prototype, "accessSyncAck", null);
exports.CommunicationController = CommunicationController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof communication_service_1.CommunicationService !== "undefined" && communication_service_1.CommunicationService) === "function" ? _a : Object])
], CommunicationController);


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommunicationService = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const prisma_client_mygate_1 = __webpack_require__(10);
const mainflux_service_1 = __webpack_require__(23);
const mygate_service_1 = __webpack_require__(35);
const env_consts_1 = __webpack_require__(16);
const schedule_1 = __webpack_require__(36);
const mqtt = tslib_1.__importStar(__webpack_require__(25));
let CommunicationService = exports.CommunicationService = class CommunicationService {
    constructor(prismaService, mainFluxService, myGateService) {
        this.prismaService = prismaService;
        this.mainFluxService = mainFluxService;
        this.myGateService = myGateService;
        this.connections = new Map();
    }
    async deviceSyncMQTT() {
        try {
            const devices = await this.prismaService.device.findMany({});
            const toBeAdded = devices.filter((c) => !this.connections.has(c.thingId));
            console.log("toBe added .. :  ", toBeAdded);
            // TODO: implement workers
            for (const device of toBeAdded) {
                await this.addNewConnection(device.thingId, device.thingKey, device.channelId, `channels/${device.channelId}/messages/unique`);
            }
        }
        catch (e) {
            common_1.Logger.log('deviceSync', e);
        }
    }
    async addNewConnection(thingId, thingKey, channelId, topicName) {
        const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
        const mqttOptions = {
            clientId,
            clean: true,
            connectTimeout: 4000,
            username: thingId,
            password: thingKey,
            reconnectPeriod: 1000,
            // additional options can be added here
        };
        // Connect to the MQTT broker
        const client = mqtt.connect(`mqtt://${env_consts_1.MQTT_DOMAIN_MYGATE}:${env_consts_1.MQTT_PORT_MYGATE}`, mqttOptions);
        const subscriptionTopic = `channels/${channelId}/messages/mygate-notify`;
        // Handle incoming messages
        client.on('message', async (topic, message) => {
            const topic_res = topic.split("/");
            console.log(topic_res);
            console.log(`Received message on ${topic}: ${message.toString()}`); // Log the received message
            const channel_id = topic_res[1];
            const notifyTopic = topic_res[3];
            console.log(notifyTopic);
            const deviceToPublish = await this.prismaService.device.findFirst({
                where: {
                    channelId: channel_id
                }
            });
            if (notifyTopic === 'mygate-notify') {
                const publishedMessage = message.toString();
                try {
                    const deviceMessage = JSON.parse(publishedMessage);
                    console.log(deviceMessage);
                    if ('ci' in deviceMessage && 'ts' in deviceMessage && 'st' in deviceMessage && 'dr' in deviceMessage) {
                        await this.accessNotify(deviceToPublish.deviceId, deviceMessage);
                    }
                    else {
                        console.log("just displaying the message: ", deviceMessage);
                    }
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
        // Subscribe to the specified topic
        client.on('connect', () => {
            client.subscribe(subscriptionTopic, (err) => {
                if (err) {
                    common_1.Logger.error(`Error while subscribing to ${subscriptionTopic}: ${err}`);
                }
                else {
                    common_1.Logger.log(`Subscribed to ${subscriptionTopic} for thingId: ${thingId}`);
                }
            });
        });
        // Store the connection in the map
        this.connections.set(thingId, client);
    }
    // Function to disconnect from the MQTT broker
    disconnect() {
        this.connections.forEach((client) => {
            client.end();
        });
        this.connections.clear();
    }
    async accessNotify(deviceId, accessNotifyDto) {
        // get device by device id
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: deviceId,
            },
        });
        if (!device) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        // TODO: maintain MQTT status
        //.....
        // const isPublishedToMqtt = await this.mainFluxService.publishNotifyToMqtt(
        //   accessNotifyDto,
        //   deviceId,
        //   device.thingId,
        //   device.thingKey,
        //   device.channelId
        // );
        //......
        // if (!isPublishedToMqtt) {
        //   // TODO: maintain publish status
        //   console.error(`Could not publish to MQTT`, accessNotifyDto);
        // }
        if (!device.isMyGateDevice) {
            return { success: true };
        }
        // get card by access display
        const myGateCard = await this.prismaService.myGateCard.findFirst({
            where: {
                accessDisplay: accessNotifyDto.ci,
                deviceId: device.id
            },
        });
        if (!myGateCard) {
            throw new common_1.HttpException('MyGate card not found', common_1.HttpStatus.NOT_FOUND);
        }
        let myGateNotifyResponse;
        let isNotified = false;
        let isNotifiedSuccessfully = false;
        let response_timestamp;
        try {
            // call MyGate notify
            myGateNotifyResponse = await this.myGateService.myGateNotify({
                device_id: device.deviceId,
                access_uuid_type: myGateCard.accessUuidType,
                access_entity_type: myGateCard.accessEntityType,
                access_ref_id: myGateCard.accessRefId,
                access_uuid_captured: accessNotifyDto.ci,
                direction: accessNotifyDto.dr,
                status: accessNotifyDto.st,
                timestamp: String(accessNotifyDto.ts),
            });
            isNotified = true;
            isNotifiedSuccessfully = myGateNotifyResponse.data.es == '0' && myGateNotifyResponse.data.message.toUpperCase() === 'Success'.toUpperCase();
            response_timestamp = new Date();
        }
        catch (error) {
            console.log('error while notifying to mygate , ', error);
        }
        console.log('Published notification to MyGate from device', deviceId, accessNotifyDto);
        console.log("MyGate Response ", myGateNotifyResponse?.data);
        const log = await this.prismaService.myGateLog.create({
            data: {
                timestamp: Number(accessNotifyDto.ts),
                status: accessNotifyDto.st,
                direction: accessNotifyDto.dr,
                myGateCardId: myGateCard.id,
                isNotifiedToMyGate: isNotified,
                myGateResponse: isNotified == true ? myGateNotifyResponse?.data : null,
                myGateResponseTimestamp: isNotified == true ? response_timestamp : null,
                isNotifiedToMyGateSuccessfully: isNotifiedSuccessfully
            },
        });
        if (!log)
            throw new common_1.HttpException("internal server error while creating log", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        console.log('Received MyGate notification from device', deviceId, accessNotifyDto);
        console.log('success notification with typeof ', myGateNotifyResponse?.data);
        return {
            success: true,
        };
    }
    async getCredentials(deviceId) {
        const deviceResponse = await this.prismaService.device.findFirst({
            where: {
                deviceId: deviceId,
            },
        });
        if (!deviceResponse) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            status: true,
            resp: {
                imei: deviceId,
                clientid: deviceResponse.channelId,
                username: deviceResponse.thingId,
                password: deviceResponse.thingKey,
                broker: env_consts_1.MQTT_DOMAIN_MYGATE,
                port: env_consts_1.MQTT_PORT_MYGATE,
                notify: env_consts_1.API_URL + `/notify/${deviceId}`,
            },
        };
    }
    async getTime() {
        // TODO: handle time zone
        const now = new Date();
        return {
            status: true,
            datetime: {
                day: now.getDate(),
                month: now.getMonth() + 1,
                year: now.getFullYear() - 2000,
                hour: now.getHours(),
                min: now.getMinutes(),
                sec: now.getSeconds(),
            },
        };
    }
    async iAmHere(deviceId) {
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: String(deviceId),
            },
        });
        if (!device) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.prismaService.iAmHereLog.create({
            data: {
                deviceId: device.id,
            },
        });
    }
    // utility method
    async accessSync(deviceId, accessSyncDto) {
        const device = await this.prismaService.device.findFirst({
            where: { deviceId: deviceId },
        });
        if (!device) {
            throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.mainFluxService.connectAndPublishWithRetry(accessSyncDto, device.thingId, device.thingKey, device.channelId, 'mygate-sync');
    }
    async accessSyncAck(deviceId, accessSyncAckDto) {
        let id;
        let isMyGateDevice = false;
        console.log('Received sync ack from device', deviceId, accessSyncAckDto);
        await this.prismaService.$transaction(async (tx) => {
            const device = await tx.device.findFirst({
                where: { deviceId: deviceId },
            });
            if (!device) {
                throw new common_1.HttpException('Device not found', common_1.HttpStatus.NOT_FOUND);
            }
            id = device.id;
            isMyGateDevice = device.isMyGateDevice;
            const syncMessage = await tx.syncMessage.findFirst({
                where: {
                    deviceId: device.id,
                    syncToken: accessSyncAckDto.st,
                },
                include: {
                    cards: true,
                },
            });
            if (!syncMessage) {
                throw new common_1.HttpException('Sync message not found', common_1.HttpStatus.NOT_FOUND);
            }
            const cards = syncMessage.cards;
            const addedCards = cards
                .filter((c) => c.status === 'ADD')
                .map((c) => c.cardId);
            const removedCards = cards
                .filter((c) => c.status === 'REMOVE')
                .map((c) => c.cardId);
            for (const addedCard of addedCards) {
                await tx.deviceCard.upsert({
                    create: {
                        deviceId: device.id,
                        cardId: addedCard,
                    },
                    update: {},
                    where: {
                        deviceId_cardId: {
                            deviceId: device.id,
                            cardId: addedCard,
                        },
                    },
                });
            }
            await tx.deviceCard.deleteMany({
                where: {
                    deviceId: device.id,
                    cardId: {
                        in: removedCards,
                    },
                },
            });
            await tx.syncMessageCard.deleteMany({
                where: {
                    syncMessageId: syncMessage.id,
                },
            });
            await tx.syncMessage.delete({
                where: {
                    id: syncMessage.id,
                },
            });
        });
        console.log('Processed sync ack from device', deviceId, accessSyncAckDto);
        // TODO: implement worker
        if (isMyGateDevice) {
            await this.myGateService.deviceSyncMyGateForDevice(id);
        }
        return { status: 'ok' };
    }
};
tslib_1.__decorate([
    (0, schedule_1.Cron)(env_consts_1.DEVICE_SYNC_CRON, {
        name: 'deviceSyncMQTT',
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], CommunicationService.prototype, "deviceSyncMQTT", null);
exports.CommunicationService = CommunicationService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof prisma_client_mygate_1.PrismaService !== "undefined" && prisma_client_mygate_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof mainflux_service_1.MainFluxService !== "undefined" && mainflux_service_1.MainFluxService) === "function" ? _b : Object, typeof (_c = typeof mygate_service_1.MyGateService !== "undefined" && mygate_service_1.MyGateService) === "function" ? _c : Object])
], CommunicationService);


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccessNotifyDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
class AccessNotifyDto {
}
exports.AccessNotifyDto = AccessNotifyDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AccessNotifyDto.prototype, "ci", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AccessNotifyDto.prototype, "ts", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AccessNotifyDto.prototype, "st", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AccessNotifyDto.prototype, "dr", void 0);


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DateTimeForDeviceDto = exports.DateTimeDto = exports.DeviceCredentialsResponseForDeviceDto = exports.DeviceCredentialsResponseDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
class DeviceCredentialsResponseDto {
}
exports.DeviceCredentialsResponseDto = DeviceCredentialsResponseDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceCredentialsResponseDto.prototype, "imei", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceCredentialsResponseDto.prototype, "clientid", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceCredentialsResponseDto.prototype, "username", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceCredentialsResponseDto.prototype, "password", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceCredentialsResponseDto.prototype, "broker", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceCredentialsResponseDto.prototype, "port", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], DeviceCredentialsResponseDto.prototype, "notify", void 0);
class DeviceCredentialsResponseForDeviceDto {
}
exports.DeviceCredentialsResponseForDeviceDto = DeviceCredentialsResponseForDeviceDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Boolean)
], DeviceCredentialsResponseForDeviceDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", DeviceCredentialsResponseDto)
], DeviceCredentialsResponseForDeviceDto.prototype, "resp", void 0);
class DateTimeDto {
}
exports.DateTimeDto = DateTimeDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], DateTimeDto.prototype, "day", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], DateTimeDto.prototype, "month", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], DateTimeDto.prototype, "year", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], DateTimeDto.prototype, "hour", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], DateTimeDto.prototype, "min", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], DateTimeDto.prototype, "sec", void 0);
class DateTimeForDeviceDto {
}
exports.DateTimeForDeviceDto = DateTimeForDeviceDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Boolean)
], DateTimeForDeviceDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", DateTimeDto)
], DateTimeForDeviceDto.prototype, "datetime", void 0);


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccessSyncDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
class AccessSyncDto {
}
exports.AccessSyncDto = AccessSyncDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AccessSyncDto.prototype, "st", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], AccessSyncDto.prototype, "na", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Array)
], AccessSyncDto.prototype, "a", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Number)
], AccessSyncDto.prototype, "nr", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Array)
], AccessSyncDto.prototype, "r", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AccessSyncDto.prototype, "t", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AccessSyncDto.prototype, "l", void 0);


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccessSyncAckDto = void 0;
const tslib_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(4);
class AccessSyncAckDto {
}
exports.AccessSyncAckDto = AccessSyncAckDto;
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", String)
], AccessSyncAckDto.prototype, "st", void 0);
tslib_1.__decorate([
    (0, swagger_1.ApiProperty)(),
    tslib_1.__metadata("design:type", Boolean)
], AccessSyncAckDto.prototype, "status", void 0);


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserModule = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const user_controller_1 = __webpack_require__(50);
const user_service_1 = __webpack_require__(53);
const auth_service_1 = __webpack_require__(9);
const config_1 = __webpack_require__(14);
const prisma_client_mygate_1 = __webpack_require__(10);
const jwt_1 = __webpack_require__(17);
let UserModule = exports.UserModule = class UserModule {
};
exports.UserModule = UserModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [],
        providers: [user_service_1.UserService, config_1.ConfigService, prisma_client_mygate_1.PrismaService, auth_service_1.AuthService, jwt_1.JwtService],
        controllers: [user_controller_1.userController]
    })
], UserModule);


/***/ }),
/* 50 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.userController = void 0;
const tslib_1 = __webpack_require__(6);
const common_1 = __webpack_require__(1);
const swagger_1 = __webpack_require__(4);
const user_dto_1 = __webpack_require__(51);
const user_service_1 = __webpack_require__(53);
let userController = exports.userController = class userController {
    constructor(userService) {
        this.userService = userService;
    }
    userSignup(SignUpBody) {
        return this.userService.UserSignup(SignUpBody);
    }
    // @UseGuards(UserAuthGuard)
    // @UseGuards(UserAuthGuard)
    userSignin(SignInBody) {
        return this.userService.UserSignIn(SignInBody);
    }
};
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'create new user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
    }),
    (0, common_1.Post)('signup'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof user_dto_1.UserSignUpDTO !== "undefined" && user_dto_1.UserSignUpDTO) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], userController.prototype, "userSignup", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'SignIn user'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Success',
    }),
    (0, common_1.Post)('signin')
    // @UseGuards(UserAuthGuard)
    // @UseGuards(UserAuthGuard)
    ,
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof user_dto_1.UserSignInDTO !== "undefined" && user_dto_1.UserSignInDTO) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], userController.prototype, "userSignin", null);
exports.userController = userController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('user'),
    (0, common_1.Controller)('user'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object])
], userController);


/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserSignInDTO = exports.UserSignUpDTO = void 0;
const tslib_1 = __webpack_require__(6);
const class_validator_1 = __webpack_require__(52);
class UserSignUpDTO {
}
exports.UserSignUpDTO = UserSignUpDTO;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UserSignUpDTO.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UserSignUpDTO.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UserSignUpDTO.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UserSignUpDTO.prototype, "password", void 0);
class UserSignInDTO {
}
exports.UserSignInDTO = UserSignInDTO;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UserSignInDTO.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], UserSignInDTO.prototype, "password", void 0);


/***/ }),
/* 52 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserService = void 0;
const tslib_1 = __webpack_require__(6);
const prisma_client_mygate_1 = __webpack_require__(10);
const auth_service_1 = __webpack_require__(9);
const library_1 = __webpack_require__(54);
const common_1 = __webpack_require__(1);
const common_2 = __webpack_require__(1);
let UserService = exports.UserService = class UserService {
    constructor(prisma, authService) {
        this.prisma = prisma;
        this.authService = authService;
    }
    async UserSignup(SignUpBody) {
        const hash = await this.authService.hashPassword(SignUpBody.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: SignUpBody.email,
                    firstName: SignUpBody.firstName,
                    lastName: SignUpBody.lastName,
                    isActive: true,
                    password: hash,
                }
            });
            return {
                status: common_2.HttpStatus.CREATED
            };
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P0002') {
                    throw new common_1.ForbiddenException('User Already Exist with same credentials');
                }
            }
            throw error;
        }
    }
    async UserSignIn(SignInBody) {
        console.log(SignInBody);
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: SignInBody.email
                }
            });
            if (!user) {
                throw new common_1.ForbiddenException("Credentials Incorrect");
            }
            // console.log(SignInBody.password, user.password)
            const pwMatch = await this.authService.comparePasswords(SignInBody.password, user.password);
            if (!pwMatch) {
                throw new common_1.ForbiddenException("Password Incorrect!");
            }
            // console.log(user.id , user.email)
            return this.authService.createToken(user.firstName, user.email);
        }
        catch (error) {
            throw error;
        }
    }
};
exports.UserService = UserService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof prisma_client_mygate_1.PrismaService !== "undefined" && prisma_client_mygate_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object])
], UserService);


/***/ }),
/* 54 */
/***/ ((module) => {

module.exports = require("@prisma/client/runtime/library");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const path_1 = __webpack_require__(3);
const swagger_1 = __webpack_require__(4);
const app_module_1 = __webpack_require__(5);
const env_consts_1 = __webpack_require__(16);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const port = env_consts_1.PORT || 3005;
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FountLab Flux MyGate API')
        .setDescription('FountLab Flux MyGate API')
        .setVersion('1.0')
        .addTag('mygate')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('swagger', app, document);
    app.enableCors();
    app.useStaticAssets((0, path_1.join)(__dirname, '..', '..', '..', 'dist', 'mygate-ui'));
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', '..', '..', 'apps', 'api-mygate', 'src', 'assets', 'views'));
    app.setViewEngine('hbs');
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map