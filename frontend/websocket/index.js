"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
// websocketServer.ts
var ws_1 = require("ws");
var http = require("http");
var client_1 = require("../prisma/client");
// Create HTTP server
var server = http.createServer();
exports.server = server;
// Create WebSocket server
var wss = new ws_1.WebSocketServer({ server: server });
// Track connected clients
var clients = new Set();
// Handle WebSocket connections
wss.on('connection', function (ws) {
    console.log('Client connected');
    clients.add(ws);
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'info',
        message: 'Connected to WebSocket server'
    }));
    // Handle incoming messages
    ws.on('message', function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var data, userId, user, userError_1, _a, dbError_1, parseError_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Received raw message:', message.toString());
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 20, , 21]);
                    data = JSON.parse(message.toString());
                    console.log('Parsed message data:', data);
                    userId = data.userId ? Number(data.userId) : null;
                    if (!userId) {
                        console.log('No user ID provided, skipping database operations');
                        return [2 /*return*/];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, client_1.prisma.user.findUnique({
                            where: { id: userId }
                        })];
                case 3:
                    user = _b.sent();
                    if (!user) {
                        console.error("User with ID ".concat(userId, " not found"));
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    userError_1 = _b.sent();
                    console.error('Error finding user:', userError_1);
                    return [2 /*return*/];
                case 5:
                    _b.trys.push([5, 18, , 19]);
                    _a = data.type;
                    switch (_a) {
                        case 'keystroke': return [3 /*break*/, 6];
                        case 'mouseMovement': return [3 /*break*/, 9];
                        case 'tabSwitch': return [3 /*break*/, 12];
                        case 'heartbeat': return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 16];
                case 6:
                    console.log("Processing keystroke: ".concat(data.keyPressed, " for user ").concat(userId));
                    // Store keystroke
                    return [4 /*yield*/, client_1.prisma.keystroke.create({
                            data: {
                                userId: userId,
                                keyPressed: String(data.keyPressed || '')
                            }
                        })];
                case 7:
                    // Store keystroke
                    _b.sent();
                    // Log event
                    return [4 /*yield*/, client_1.prisma.eventLog.create({
                            data: {
                                userId: userId,
                                eventType: 'keyispressed',
                                details: "Key pressed: ".concat(data.keyPressed)
                            }
                        })];
                case 8:
                    // Log event
                    _b.sent();
                    console.log('Keystroke stored successfully');
                    return [3 /*break*/, 17];
                case 9:
                    console.log("Processing mouse movement: (".concat(data.xPos, ", ").concat(data.yPos, ") for user ").concat(userId));
                    // Store mouse movement
                    return [4 /*yield*/, client_1.prisma.mouseMovement.create({
                            data: {
                                userId: userId,
                                xPos: Number(data.xPos || 0),
                                yPos: Number(data.yPos || 0)
                            }
                        })];
                case 10:
                    // Store mouse movement
                    _b.sent();
                    // Log event
                    return [4 /*yield*/, client_1.prisma.eventLog.create({
                            data: {
                                userId: userId,
                                eventType: 'mousemoved',
                                details: "Mouse moved to: (".concat(data.xPos, ", ").concat(data.yPos, ")")
                            }
                        })];
                case 11:
                    // Log event
                    _b.sent();
                    console.log('Mouse movement stored successfully');
                    return [3 /*break*/, 17];
                case 12:
                    console.log("Processing tab switch: ".concat(data.tabUrl, " for user ").concat(userId));
                    // Store tab switch
                    return [4 /*yield*/, client_1.prisma.tabSwitch.create({
                            data: {
                                userId: userId,
                                tabUrl: String(data.tabUrl || '')
                            }
                        })];
                case 13:
                    // Store tab switch
                    _b.sent();
                    // Log event
                    return [4 /*yield*/, client_1.prisma.eventLog.create({
                            data: {
                                userId: userId,
                                eventType: 'tabswitched',
                                details: "Tab switched to: ".concat(data.tabUrl)
                            }
                        })];
                case 14:
                    // Log event
                    _b.sent();
                    console.log('Tab switch stored successfully');
                    return [3 /*break*/, 17];
                case 15:
                    // Just acknowledge heartbeats
                    ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
                    return [3 /*break*/, 17];
                case 16:
                    console.log("Unknown event type: ".concat(data.type));
                    _b.label = 17;
                case 17: return [3 /*break*/, 19];
                case 18:
                    dbError_1 = _b.sent();
                    console.error("Error storing ".concat(data.type, " event:"), dbError_1);
                    return [3 /*break*/, 19];
                case 19: return [3 /*break*/, 21];
                case 20:
                    parseError_1 = _b.sent();
                    console.error('Error parsing message:', parseError_1);
                    return [3 /*break*/, 21];
                case 21: return [2 /*return*/];
            }
        });
    }); });
    // Handle disconnection
    ws.on('close', function () {
        clients.delete(ws);
        console.log('Client disconnected');
    });
    // Handle errors
    ws.on('error', function (error) {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});
// Handle server errors
server.on('error', function (error) {
    console.error('Server error:', error);
});
// Start the server
var PORT = process.env.PORT || 8080;
server.listen(PORT, function () {
    console.log("WebSocket server running on port ".concat(PORT));
});
// Handle process errors
process.on('uncaughtException', function (error) {
    console.error('Uncaught exception:', error);
});
process.on('unhandledRejection', function (reason, promise) {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
